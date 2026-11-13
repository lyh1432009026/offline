# highlight.js — 内网离线使用教程

> 所属分类：图表渲染　|　版本：11.12.0　|　许可：BSD-3-Clause　|　资源体积：展开 2.7 MB / 下载包 0.5 MB · 910 个文件

代码高亮库，常见失效原因是主题 CSS 用了 cdnjs 外链。

## 一、离线风险点

默认会请求的公网域名：`cdnjs.cloudflare.com`、`cdn.jsdelivr.net`

必须随包发布的文件：

- `styles/github.css`
- `styles/github-dark.css`
- `lib/common.js`

## 二、接入步骤

安装 / 部署：

```bash
npm i highlight.js@11.12.0
```

### 1. 删除主题 CDN 链接

很多项目只在 index.html 用 link 引了主题 CSS，这是离线后代码「有结构无配色」的根因。把 styles/*.css 拷到内网并在入口引入。

```
import 'highlight.js/styles/github.css'
```

### 2. 按需注册语言

用 lib/common 或逐语言注册，避免全量包。Vditor、md-editor-v3 等编辑器若自带高亮，注意不要重复引入产生两套样式。

```
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
hljs.registerLanguage('javascript', javascript)
```

### 3. 在正确时机执行高亮

SPA 需在数据渲染完成后的 nextTick 调用 highlightElement，且对同一节点只处理一次（用 dataset 标记）。

```
await nextTick()
if (!el.dataset.highlighted) { hljs.highlightElement(el); el.dataset.highlighted = 'yes' }
```

## 三、推荐配置

```js
import hljs from 'highlight.js/lib/common'
import '/vendor/highlight.js/styles/github.css'

document.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el))
```

## 四、常见坑

- 主题 CSS 未引入时不会报错，只是没有颜色
- highlightAll 会重复处理已高亮节点
- 部分主题引用外部字体或背景图，需检查 CSS 内 url()

## 五、断网验收

断网打开含代码块页面，配色正确，Network 无 cdnjs 请求。

## 六、资源包

- 下载：`vendor/highlightjs/highlightjs-11.12.0.tar.gz`（由 `node scripts/build-vendor.mjs --only=highlightjs` 生成）
- 来源：`highlight.js@11.12.0`，npm 镜像 https://registry.npmmirror.com

---

返回 [教程索引](./INDEX.md)　|　[内网门户](../index.html)　|　清单更新日期 2026-11-12
