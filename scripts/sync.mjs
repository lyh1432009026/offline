#!/usr/bin/env node
/**
 * 从 catalog.json 生成：
 *   data/catalog.js   门户用（script 标签加载，file:// 双击可用）
 *   docs/<id>.md      每个组件独立使用教程
 *   docs/INDEX.md     教程索引
 *   catalog.min.json  供其他工具消费的精简索引
 * 改完 catalog.json 后运行：node scripts/sync.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const catalog = JSON.parse(readFileSync(join(ROOT, 'catalog.json'), 'utf8'))
const { meta, categories, items } = catalog

const catName = (id) => categories.find((c) => c.id === id)?.name ?? id
const code = (s, lang = '') => (s && s.trim() ? `\`\`\`${lang}\n${s.trim()}\n\`\`\`` : '')
const mdEsc = (s = '') => String(s).replace(/\|/g, '\\|')

mkdirSync(join(ROOT, 'data'), { recursive: true })
mkdirSync(join(ROOT, 'docs'), { recursive: true })

// 1. 门户数据源：用 script 标签加载，避免 file:// 下 fetch 被 CORS 拦截
writeFileSync(
  join(ROOT, 'data', 'catalog.js'),
  `/* 由 scripts/sync.mjs 生成，请勿直接编辑；修改 catalog.json 后重新运行 */\nwindow.__OFFLINE_HUB__ = ${JSON.stringify(catalog, null, 2)};\n`,
  'utf8'
)

// 2. 每个组件独立教程
const byCat = new Map()
for (const item of items) {
  const lines = []
  lines.push(`# ${item.name} — 内网离线使用教程`, '')
  lines.push(`> 所属分类：${catName(item.category)}　|　版本：${item.version}　|　许可：${item.license}　|　资源体积：${item.size}`, '')
  lines.push(item.summary, '')
  lines.push('## 一、离线风险点', '')
  const hosts = item.cdnHosts?.length ? item.cdnHosts.map((h) => `\`${h}\``).join('、') : '无（纯本地包）'
  lines.push(`默认会请求的公网域名：${hosts}`, '')
  lines.push('必须随包发布的文件：', '')
  if (item.files?.length) item.files.forEach((f) => lines.push(`- \`${f}\``))
  else lines.push('- 无额外静态资源，npm 包随构建产物发布即可')
  lines.push('')
  lines.push('## 二、接入步骤', '')
  lines.push('安装 / 部署：', '')
  lines.push(code(item.install || '从本库下载资源包并放入 public/', 'bash'), '')
  ;(item.tutorial || []).forEach((step, i) => {
    lines.push(`### ${i + 1}. ${step.title}`, '')
    lines.push(step.body, '')
    if (step.code) lines.push(code(step.code), '')
  })
  lines.push('## 三、推荐配置', '')
  lines.push(code(item.snippet, 'js'), '')
  lines.push('## 四、常见坑', '')
  ;(item.pitfalls || []).forEach((p) => lines.push(`- ${p}`))
  lines.push('')
  lines.push('## 五、断网验收', '')
  lines.push(item.verify || '断网后遍历相关页面，确认 Network 面板无公网域名请求。', '')
  lines.push('## 六、资源包', '')
  if (item.package || item.localDir) {
    lines.push(`- 下载：\`vendor/${item.id}/${item.id}-${item.version}.tar.gz\`（由 \`node scripts/build-vendor.mjs --only=${item.id}\` 生成）`)
    lines.push(item.package
      ? `- 来源：\`${item.package}@${item.version}\`，npm 镜像 ${meta.registry}`
      : `- 来源：本地方案目录 \`${item.localDir}\`（非 npm，脚本直接打包目录）`)
    if (item.localDir) lines.push(`- 完整部署文档：\`${item.localDir}/README.md\``)
  } else {
    lines.push('- 该项不走 npm，按教程手工准备资源后放入 `vendor/' + item.id + '/`')
  }
  lines.push('')
  lines.push(`---`, '')
  lines.push(`返回 [教程索引](./INDEX.md)　|　[内网门户](../index.html)　|　清单更新日期 ${meta.updated}`, '')
  writeFileSync(join(ROOT, 'docs', `${item.id}.md`), lines.join('\n'), 'utf8')

  if (!byCat.has(item.category)) byCat.set(item.category, [])
  byCat.get(item.category).push(item)
}

// 3. 教程索引
const idx = []
idx.push('# 离线组件使用教程索引', '')
idx.push(`${meta.description}`, '')
idx.push(`共 ${items.length} 个组件，更新于 ${meta.updated}。每个组件一页，包含离线风险点、逐步教程、推荐配置、常见坑与断网验收方法。`, '')
idx.push('## 按分类查阅', '')
for (const cat of categories) {
  const list = byCat.get(cat.id) || []
  if (!list.length) continue
  idx.push(`### ${cat.name}（${list.length}）`, '')
  idx.push('| 组件 | 版本 | 默认公网依赖 | 教程 |', '| --- | --- | --- | --- |')
  for (const it of list) {
    const h = it.cdnHosts?.length ? it.cdnHosts.map(mdEsc).join(', ') : '无'
    idx.push(`| ${it.name} | ${it.version} | ${h} | [${it.id}.md](./${it.id}.md) |`)
  }
  idx.push('')
}
idx.push('## 使用流程', '')
idx.push('1. 在联网机执行 `node scripts/build-vendor.mjs` 生成资源包与 `vendor/manifest.json`。')
idx.push('2. 把整个目录（含 `vendor/`、`docs/`、`index.html`）拷入内网，按 `deploy/nginx.conf` 发布。')
idx.push('3. 业务项目按对应教程引入资源，改完执行 `node scripts/check-offline.mjs <dist目录>` 自检。')
idx.push('')
idx.push('## 维护', '')
idx.push('- 新增/升级组件：改 `catalog.json` → 运行 `node scripts/sync.mjs` → 运行 `node scripts/build-vendor.mjs --only=<id>`。')
idx.push('- `catalog.json` 是唯一数据源，请勿直接改 `data/catalog.js` 或 `docs/*.md`。')
idx.push('')
writeFileSync(join(ROOT, 'docs', 'INDEX.md'), idx.join('\n'), 'utf8')

// 4. 精简索引，方便其他系统消费
const mini = items.map((i) => ({
  id: i.id, name: i.name, category: i.category, package: i.package,
  version: i.version, cdnHosts: i.cdnHosts, size: i.size, prefetch: !!i.prefetch,
  doc: `docs/${i.id}.md`
}))
writeFileSync(join(ROOT, 'catalog.min.json'), JSON.stringify({ meta, items: mini }, null, 2) + '\n', 'utf8')

const hostSet = new Set(items.flatMap((i) => i.cdnHosts || []))
console.log(`[sync] 组件 ${items.length} 个，分类 ${categories.length} 个，公网域名 ${hostSet.size} 个`)
console.log(`[sync] 已生成 data/catalog.js、docs/*.md (${items.length + 1} 篇)、catalog.min.json`)
