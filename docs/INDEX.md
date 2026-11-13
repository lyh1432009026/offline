# 离线组件使用教程索引

把常用前端组件中默认走公网的 CDN 资源统一收口到内网，提供可下载资源包、逐组件使用教程与接入片段。

共 20 个组件，更新于 2026-11-12。每个组件一页，包含离线风险点、逐步教程、推荐配置、常见坑与断网验收方法。

## 按分类查阅

### 完整方案（1）

| 组件 | 版本 | 默认公网依赖 | 教程 |
| --- | --- | --- | --- |
| 离线百度地图完整方案 | 1.0.0 | api0.map.bdimg.com, gsp0.baidu.com, ss0.bdstatic.com, lbsyun.baidu.com | [baidu-map-offline.md](./baidu-map-offline.md) |

### 编辑器（5）

| 组件 | 版本 | 默认公网依赖 | 教程 |
| --- | --- | --- | --- |
| Vditor | 4.0.1 | unpkg.com, cdn.jsdelivr.net | [vditor.md](./vditor.md) |
| md-editor-v3 | 7.1.0 | cdn.jsdelivr.net, unpkg.com | [md-editor-v3.md](./md-editor-v3.md) |
| Monaco Editor | 0.57.0 | cdn.jsdelivr.net, unpkg.com | [monaco-editor.md](./monaco-editor.md) |
| CodeMirror 6 | 6.0.2 | 无 | [codemirror.md](./codemirror.md) |
| wangEditor | 5.1.23 | 无 | [wangeditor.md](./wangeditor.md) |

### 图标字体（2）

| 组件 | 版本 | 默认公网依赖 | 教程 |
| --- | --- | --- | --- |
| Iconify 离线图标集 | 1.2.10 | api.iconify.design, api.simplesvg.com, api.unisvg.com | [iconify.md](./iconify.md) |
| 自托管 Web 字体 | 5.3.0 | fonts.googleapis.com, fonts.gstatic.com | [fontsource.md](./fontsource.md) |

### 图表渲染（4）

| 组件 | 版本 | 默认公网依赖 | 教程 |
| --- | --- | --- | --- |
| ECharts | 6.1.0 | cdn.jsdelivr.net, api.map.baidu.com | [echarts.md](./echarts.md) |
| highlight.js | 11.12.0 | cdnjs.cloudflare.com, cdn.jsdelivr.net | [highlightjs.md](./highlightjs.md) |
| KaTeX | 0.19.1 | cdn.jsdelivr.net, cdnjs.cloudflare.com | [katex.md](./katex.md) |
| Mermaid | 12.3.0 | cdn.jsdelivr.net, unpkg.com | [mermaid.md](./mermaid.md) |

### 文档预览（4）

| 组件 | 版本 | 默认公网依赖 | 教程 |
| --- | --- | --- | --- |
| pdf.js | 6.5.438 | cdn.jsdelivr.net, unpkg.com, mozilla.github.io | [pdfjs.md](./pdfjs.md) |
| docx-preview | 0.4.1 | 无 | [docx-preview.md](./docx-preview.md) |
| SheetJS / ExcelJS | 0.18.5 | cdn.sheetjs.com | [xlsx.md](./xlsx.md) |
| jsPDF 中文字体 | 4.2.1 | cdnjs.cloudflare.com, fonts.gstatic.com | [jspdf.md](./jspdf.md) |

### 音视频（1）

| 组件 | 版本 | 默认公网依赖 | 教程 |
| --- | --- | --- | --- |
| hls.js / 视频播放 | 1.7.4 | cdn.jsdelivr.net, vjs.zencdn.net | [hlsjs.md](./hlsjs.md) |

### 三维地图（2）

| 组件 | 版本 | 默认公网依赖 | 教程 |
| --- | --- | --- | --- |
| CesiumJS | 1.147.0 | api.cesium.com, dev.virtualearth.net, cdn.jsdelivr.net | [cesium.md](./cesium.md) |
| Three.js | 0.187.0 | cdn.jsdelivr.net, unpkg.com, www.gstatic.com | [threejs.md](./threejs.md) |

### 工具服务（1）

| 组件 | 版本 | 默认公网依赖 | 教程 |
| --- | --- | --- | --- |
| 二维码 / 本地校验工具 | 1.5.4 | 无 | [qrcode.md](./qrcode.md) |

## 使用流程

1. 在联网机执行 `node scripts/build-vendor.mjs` 生成资源包与 `vendor/manifest.json`。
2. 把整个目录（含 `vendor/`、`docs/`、`index.html`）拷入内网，按 `deploy/nginx.conf` 发布。
3. 业务项目按对应教程引入资源，改完执行 `node scripts/check-offline.mjs <dist目录>` 自检。

## 维护

- 新增/升级组件：改 `catalog.json` → 运行 `node scripts/sync.mjs` → 运行 `node scripts/build-vendor.mjs --only=<id>`。
- `catalog.json` 是唯一数据源，请勿直接改 `data/catalog.js` 或 `docs/*.md`。
