/* 前端内网离线资源库 · 门户逻辑（零外部依赖、零网络请求） */
(function () {
  'use strict';

  var DATA = window.__OFFLINE_HUB__ || { meta: {}, categories: [], items: [] };
  var ITEMS = DATA.items || [];
  var CATS = DATA.categories || [];
  var state = { q: '', cat: '', host: '', hostsExpanded: false, manifest: null, openId: null };

  var $ = function (s) { return document.querySelector(s); };
  var esc = function (v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var catName = function (id) {
    var c = CATS.filter(function (x) { return x.id === id; })[0];
    return c ? c.name : id;
  };
  var allHosts = (function () {
    var seen = {}, out = [];
    ITEMS.forEach(function (it) {
      (it.cdnHosts || []).forEach(function (h) { if (!seen[h]) { seen[h] = 1; out.push(h); } });
    });
    return out;
  })();

  function manifestOf(id) {
    if (!state.manifest) return null;
    var list = state.manifest.items || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function toast(msg) {
    var el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove('show'); }, 1900);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { toast('配置片段已复制'); }, fallback);
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); toast('配置片段已复制'); }
      catch (e) { toast('复制失败，请在详情中手动选中'); }
      document.body.removeChild(ta);
    }
  }

  function renderStats() {
    var noCdn = ITEMS.filter(function (i) { return !i.cdnHosts || !i.cdnHosts.length; }).length;
    var built = state.manifest ? state.manifest.total : 0;
    var html = '';
    html += '<div class="stat"><b>' + ITEMS.length + '</b><span>收录组件</span></div>';
    html += '<div class="stat"><b>' + allHosts.length + '</b><span>公网依赖域名</span></div>';
    html += '<div class="stat"><b>' + noCdn + '</b><span>天然离线组件</span></div>';
    html += '<div class="stat"><b>' + built + '</b><span>已生成资源包</span></div>';
    $('#stats').innerHTML = html;
    $('#footer-meta').textContent = DATA.meta.name + ' v' + (DATA.meta.version || '1.0.0') +
      ' · 清单更新 ' + (DATA.meta.updated || '-') +
      (state.manifest ? ' · 资源包构建于 ' + state.manifest.generatedAt.slice(0, 10) : ' · 资源包尚未生成');
  }

  function renderChips() {
    var c = '<button class="chip' + (state.cat === '' ? ' on' : '') + '" data-cat="">全部</button>';
    CATS.forEach(function (x) {
      var n = ITEMS.filter(function (i) { return i.category === x.id; }).length;
      if (!n) return;
      c += '<button class="chip' + (state.cat === x.id ? ' on' : '') + '" data-cat="' + esc(x.id) + '">' +
        esc(x.name) + ' <span style="opacity:.65">' + n + '</span></button>';
    });
    $('#category-chips').innerHTML = c;

    var shown = state.hostsExpanded ? allHosts : allHosts.slice(0, 8);
    var h = '<button class="chip' + (state.host === '' ? ' on' : '') + '" data-host="">不限</button>';
    shown.forEach(function (x) {
      h += '<button class="chip host' + (state.host === x ? ' on' : '') + '" data-host="' + esc(x) + '">' + esc(x) + '</button>';
    });
    if (allHosts.length > 8) {
      h += '<button class="chip-more" id="host-more">' + (state.hostsExpanded ? '收起' : '展开全部 ' + allHosts.length + ' 个') + '</button>';
    }
    $('#host-chips').innerHTML = h;
  }

  function filtered() {
    var q = state.q.trim().toLowerCase();
    return ITEMS.filter(function (it) {
      if (state.cat && it.category !== state.cat) return false;
      if (state.host && (it.cdnHosts || []).indexOf(state.host) < 0) return false;
      if (!q) return true;
      var hay = [it.id, it.name, it.package, it.summary, it.license, catName(it.category)]
        .concat(it.cdnHosts || []).join(' ').toLowerCase();
      return hay.indexOf(q) >= 0;
    });
  }

  function renderGrid() {
    var list = filtered();
    $('#result-count').textContent = '（' + list.length + ' / ' + ITEMS.length + '）';
    $('#empty').hidden = list.length > 0;
    $('#grid').innerHTML = list.map(function (it) {
      var hosts = it.cdnHosts || [];
      var tags = hosts.length
        ? hosts.slice(0, 3).map(function (h) { return '<span class="host-tag">' + esc(h) + '</span>'; }).join('') +
          (hosts.length > 3 ? '<span class="host-tag">+' + (hosts.length - 3) + '</span>' : '')
        : '<span class="host-tag clean">无公网依赖</span>';
      var m = manifestOf(it.id);
      var ver = m ? m.version : it.version;
      return '<article class="card" data-id="' + esc(it.id) + '" tabindex="0">' +
        '<div class="card-top"><div><h3 class="card-title">' + esc(it.name) + '</h3>' +
        '<span class="tag">' + esc(catName(it.category)) + '</span></div>' +
        '<span class="ver">v' + esc(ver) + '</span></div>' +
        '<p class="card-summary">' + esc(it.summary) + '</p>' +
        '<div class="hosts">' + tags + '</div>' +
        '<div class="card-actions">' +
          '<button class="btn" data-act="detail">查看教程</button>' +
          '<button class="btn" data-act="copy">复制配置</button>' +
          (m ? '<a class="btn primary" data-act="download" href="./' + esc(m.archive) + '" download>下载资源包</a>'
             : '<button class="btn" disabled title="在联网机运行 build-vendor.mjs 后生成">资源包待生成</button>') +
        '</div></article>';
    }).join('');
  }

  function renderDrawer(it) {
    var m = manifestOf(it.id);
    $('#drawer-kicker').textContent = catName(it.category) + ' · ' + it.license;
    $('#drawer-title').textContent = it.name;
    var html = '';
    html += '<div class="d-meta">' +
      '<span><b>版本 </b>' + esc(m ? m.version : it.version) + '</span>' +
      '<span><b>资源体积 </b>' + esc(it.size) + '</span>' +
      '<span><b>npm 包 </b>' + esc(it.package || '不走 npm，手工准备') + '</span>' +
      (m ? '<span><b>包内文件 </b>' + m.fileCount + ' 个</span>' : '') +
      '</div>';
    html += '<p class="d-summary">' + esc(it.summary) + '</p>';

    html += '<div class="d-section"><h3>一、离线风险点</h3>';
    var hosts = it.cdnHosts || [];
    html += '<p style="font-size:13px;color:var(--text-2);margin:0 0 8px">默认公网域名：' +
      (hosts.length ? hosts.map(function (h) { return '<code>' + esc(h) + '</code>'; }).join(' ') : '<span style="color:#2b7a4b">无，纯本地包</span>') + '</p>';
    html += '<p style="font-size:13px;color:var(--text-2);margin:0 0 6px">必须随包发布：</p><div class="d-filelist">' +
      ((it.files || []).length
        ? it.files.map(function (f) { return '<code>' + esc(f) + '</code>'; }).join('')
        : '<code>无额外静态资源</code>') + '</div></div>';

    html += '<div class="d-section"><h3>二、接入步骤</h3>';
    if (it.install) html += '<p style="font-size:13px;color:var(--text-2);margin:0 0 4px">安装 / 部署：</p><pre><code>' + esc(it.install) + '</code></pre>';
    (it.tutorial || []).forEach(function (s, i) {
      html += '<div class="d-step" data-n="' + (i + 1) + '"><h4>' + esc(s.title) + '</h4><p>' + esc(s.body) + '</p>' +
        (s.code ? '<pre><code>' + esc(s.code) + '</code></pre>' : '') + '</div>';
    });
    html += '</div>';

    html += '<div class="d-section"><h3>三、推荐配置</h3><pre><code>' + esc(it.snippet || '') + '</code></pre></div>';
    html += '<div class="d-section"><h3>四、常见坑</h3><div class="d-warn"><ul>' +
      (it.pitfalls || []).map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></div></div>';
    html += '<div class="d-section"><h3>五、断网验收</h3><div class="d-ok">' + esc(it.verify || '') + '</div></div>';

    html += '<div class="d-actions">' +
      (m ? '<a class="btn primary" href="./' + esc(m.archive) + '" download>下载资源包（' + (m.archiveBytes / 1024 / 1024).toFixed(2) + ' MB）</a>'
         : '<button class="btn" disabled>资源包待生成</button>') +
      '<button class="btn" id="d-copy">复制配置片段</button>' +
      '<a class="btn" href="./docs/' + esc(it.id) + '.md">打开独立教程</a>' +
      (m ? '<span style="font-size:11.5px;color:var(--muted);align-self:center" class="mono">sha256 ' + esc(m.sha256.slice(0, 16)) + '…</span>' : '') +
      '</div>';
    $('#drawer-body').innerHTML = html;
    $('#drawer-body').scrollTop = 0;
    var cp = $('#d-copy');
    if (cp) cp.addEventListener('click', function () { copyText(it.snippet || ''); });
  }

  function openDetail(id, push) {
    var it = ITEMS.filter(function (x) { return x.id === id; })[0];
    if (!it) return;
    state.openId = id;
    renderDrawer(it);
    $('#drawer').hidden = false;
    $('#overlay').hidden = false;
    document.body.style.overflow = 'hidden';
    if (push !== false) safeHistory('#' + id);
  }
  function safeHistory(url) {
    // file:// 协议下部分浏览器禁止 replaceState，双击打开时不能因此中断交互
    try { history.replaceState(null, '', url); } catch (e) { /* 忽略 */ }
  }
  function closeDetail() {
    state.openId = null;
    $('#drawer').hidden = true;
    $('#overlay').hidden = true;
    document.body.style.overflow = '';
    safeHistory(location.pathname + location.search);
  }

  /* 事件绑定 */
  $('#search').addEventListener('input', function (e) { state.q = e.target.value; renderGrid(); });
  $('#reset').addEventListener('click', function () {
    state.q = ''; state.cat = ''; state.host = ''; state.hostsExpanded = false;
    $('#search').value = '';
    renderChips(); renderGrid();
  });
  $('#category-chips').addEventListener('click', function (e) {
    var b = e.target.closest('[data-cat]'); if (!b) return;
    state.cat = b.getAttribute('data-cat'); renderChips(); renderGrid();
  });
  $('#host-chips').addEventListener('click', function (e) {
    if (e.target.id === 'host-more') { state.hostsExpanded = !state.hostsExpanded; renderChips(); return; }
    var b = e.target.closest('[data-host]'); if (!b) return;
    var v = b.getAttribute('data-host');
    state.host = state.host === v ? '' : v; renderChips(); renderGrid();
  });
  $('#grid').addEventListener('click', function (e) {
    var card = e.target.closest('.card'); if (!card) return;
    var id = card.getAttribute('data-id');
    var it = ITEMS.filter(function (x) { return x.id === id; })[0];
    var act = e.target.closest('[data-act]');
    if (act && act.getAttribute('data-act') === 'copy') { copyText(it.snippet || ''); return; }
    if (act && act.getAttribute('data-act') === 'download') return;
    openDetail(id);
  });
  $('#grid').addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var card = e.target.closest('.card'); if (!card) return;
    e.preventDefault(); openDetail(card.getAttribute('data-id'));
  });
  $('#drawer-close').addEventListener('click', closeDetail);
  $('#overlay').addEventListener('click', closeDetail);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && state.openId) closeDetail();
    if (e.key === '/' && document.activeElement !== $('#search')) { e.preventDefault(); $('#search').focus(); }
  });

  /* 可选：资源包清单存在时加载（file:// 下不存在会静默失败） */
  function loadManifest() {
    var s = document.createElement('script');
    s.src = './vendor/manifest.js';
    s.onload = function () {
      state.manifest = window.__VENDOR_MANIFEST__ || null;
      renderStats(); renderGrid();
      if (state.openId) renderDrawer(ITEMS.filter(function (x) { return x.id === state.openId; })[0]);
    };
    document.head.appendChild(s);
  }

  renderStats(); renderChips(); renderGrid(); loadManifest();
  var hash = decodeURIComponent(location.hash.replace(/^#/, ''));
  if (hash && ITEMS.some(function (x) { return x.id === hash; })) openDetail(hash, false);
})();
