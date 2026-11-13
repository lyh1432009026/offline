# 前端内网离线资源库

把常用前端组件里**默认走公网 CDN 的资源**（Vditor 的 `cdn`、Monaco 的 loader/Worker、pdf.js 的 worker 与 cmaps、Iconify 在线图标、字体 CDN 等）统一收口，做成可下载的资源包合集，放到内网供按需自助取用。

- 收录 **20 个组件 / 8 个分类**，覆盖 **19 个公网依赖域名**
- **20 项全部预置资源包**（合计 **82.07 MB**），门户无「待生成」；含一套**离线百度地图完整方案**
- **每项一页独立教程（21 篇）**：离线风险点 → 逐步接入 → 推荐配置 → 常见坑 → 断网验收
- 门户页面本身零外部请求，可直接双击 `index.html` 打开，也可发布到内网静态服务

---

## 零、本地先看一眼

```bash
node scripts/serve.mjs                 # http://127.0.0.1:8080
node scripts/serve.mjs --port=9000     # 端口被占用时换一个
node scripts/serve.mjs --host=0.0.0.0 --port=8080   # 让同网段同事也能访问
```

零依赖静态服务，已配置 `.mjs` / `.wasm` / 字体 / `.tar.gz` 等 MIME 并禁用强缓存；改完教程刷新即可看到。门户本身零外部请求，也可以直接双击 `index.html`。

---

## 一、三步部署

### 1. 联网机生成资源包

```bash
node scripts/build-vendor.mjs              # 构建全部 20 项（19 个 npm 组件 + 1 个本地方案）
node scripts/build-vendor.mjs --all        # 忽略 prefetch 标记，强制重建全部
node scripts/build-vendor.mjs --only=vditor,pdfjs   # 只更新指定组件
```

要求 Node ≥ 18、可访问 npm 镜像。脚本是**纯 Node 实现**（fetch + zlib 自解析/生成 tar），不依赖 npm CLI、系统 tar 或任何第三方包，Windows / Linux 均可直接运行；增量构建会合并已有清单，不会覆盖其他组件。按 `catalog.json` 的版本号精确拉取，只保留 `extract` 白名单内的文件，产出：

```
vendor/<组件id>/<版本>/...                     展开后的资源（可直接引用）
vendor/<组件id>/<组件id>-<版本>.tar.gz         单组件下载包，解压得到 <组件id>/ 目录
vendor/<组件id>/meta.json                      文件数、体积、sha256
vendor/manifest.json / manifest.js             总清单（门户读取）
```

### 2. 拷进内网

把**整个目录**（含 `index.html`、`data/`、`assets/`、`docs/`、`vendor/`、`deploy/`）原样拷贝。资源包已离线生成，此步骤不需要内网有外网。

### 3. 发布与验收

```bash
nginx -c /srv/offline-hub/deploy/nginx.conf   # 先改配置里的 root
```

浏览器打开 `http://<内网地址>:8080/`，搜索组件、看教程、点「下载资源包」。配置里已包含 `.mjs` / `.wasm` / `.terrain` / `.glb` 等 MIME、CORS、gzip 与严格 CSP。

---

## 二、目录结构

| 路径 | 用途 |
| --- | --- |
| `index.html` + `assets/` | 自助下载门户（搜索、分类筛选、教程抽屉、复制配置） |
| `catalog.json` | **唯一数据源**：组件元数据 + 教程内容，维护只改这里 |
| `data/catalog.js` | 由 sync 生成，门户用 script 标签加载（`file://` 下可用） |
| `docs/*.md` | 由 sync 生成的逐组件独立教程，`INDEX.md` 为索引 |
| `vendor/` | 资源包与清单，由 build-vendor 生成 |
| `solutions/baidu-map/` | 离线百度地图完整方案：`README.md` 部署文档、`map/` 离线 API 与模块图片、`vue/` 加载器/组件/坐标工具、`config/` 环境示例与代理片段、`tiles/` 瓦片服务约定 |
| `scripts/sync.mjs` | 从 catalog.json 生成门户数据、教程、精简索引 |
| `scripts/build-vendor.mjs` | 联网机抓取 npm 包并打包 |
| `scripts/check-offline.mjs` | 扫描业务项目 `dist` 里残留的公网外链 |
| `deploy/nginx.conf` | 内网发布配置示例 |

---

## 三、命令速查

```bash
node scripts/sync.mjs                         # 改完 catalog.json 必跑
node scripts/build-vendor.mjs --dry-run        # 只看抓取计划
node scripts/build-vendor.mjs --only=vditor    # 增量更新单个组件
node scripts/check-offline.mjs ./dist          # 业务项目构建后自检
node scripts/check-offline.mjs ./dist --allow=map.internal --json
```

`check-offline.mjs` 发现公网外链时退出码为 `1`，可直接接进 CI。内网地址段（10./172.16–31./192.168./127.）、`*.internal|local|lan`、XML/JSON 命名空间域名默认放行；确属内网的域名用 `--allow` 追加。

---

## 四、逐组件教程

教程索引见 [docs/INDEX.md](./docs/INDEX.md)。每页固定六节：

1. **离线风险点** — 默认会请求的公网域名、必须随包发布的文件
2. **接入步骤** — 安装/部署命令 + 3–4 个带代码的操作步骤
3. **推荐配置** — 可直接复制的初始化片段
4. **常见坑** — 实测高频问题（Vditor 漏拷 i18n、Monaco Worker 路径、KaTeX 字体目录…）
5. **断网验收** — 具体验证动作与预期现象
6. **资源包** — 下载路径、npm 来源、版本

| 分类 | 组件 |
| --- | --- |
| 完整方案 | **离线百度地图完整方案**（离线 API 3.0 + 41 个模块 + Vue 组件 + WGS84→BD09 转换 + 瓦片服务约定） |
| 编辑器 | Vditor、md-editor-v3、Monaco Editor、CodeMirror 6、wangEditor |
| 图标字体 | Iconify 离线集、@fontsource 自托管字体 |
| 图表渲染 | ECharts、highlight.js、KaTeX、Mermaid |
| 文档预览 | pdf.js、docx-preview、SheetJS/ExcelJS、jsPDF 中文字体 |
| 音视频 | hls.js / 视频播放 |
| 三维地图 | CesiumJS、Three.js |
| 工具服务 | 二维码 / 本地校验工具 |

### 离线百度地图完整方案

门户分类「完整方案」→ [组件教程](./docs/baidu-map-offline.md)；完整部署文档见 [solutions/baidu-map/README.md](./solutions/baidu-map/README.md)；资源包 `vendor/baidu-map-offline/baidu-map-offline-1.0.0.tar.gz`（83 个文件）。

方案包含：离线 API 3.0 脚本 + 41 个 modules + 控件图片、`baiduMap.js` 幂等加载器、`BaiduMap.vue` 通用组件、`coordTransform.js` 坐标系工具、瓦片服务地址约定。两处通用化设计：默认瓦片地址采用同域相对路径 `/map-tiles`；组件默认保留版权控件。

**包内不含瓦片数据**，瓦片由内网服务按 `{z}/{x}/{y}.jpg` 提供。离线脚本从 `window.BMAP_AUTHENTIC_KEY` 读取密钥，包内无硬编码 AK。脚本残留的在线域名与离线不可用功能清单，见方案 README 第六节。

---

## 五、维护

**新增组件**：在 `catalog.json` 的 `items` 追加一条，字段参照现有条目。关键是 `package`（npm 包名，非 npm 组件填 `null`）、`extract`（tgz 内白名单，如 `package/dist/**`）、`cdnHosts`（默认公网域名）、`tutorial`（教程步骤）与 `snippet`（配置片段）。然后：

```bash
node scripts/sync.mjs
node scripts/build-vendor.mjs --only=<新组件id>
```

**升级版本**：改 `catalog.json` 里的 `version` → `sync` → `build-vendor.mjs --only=...` → 重新拷 `vendor/` 到内网。版本写在目录名里，长缓存策略可自然失效。

**全部条目默认预置**：当前 20 项均为 `prefetch: true`，一次构建即可全量本地化。若要减小交付体积，把某项的 `prefetch` 改为 `false` 并删除其 `vendor/<id>/` 目录；需要时再用 `--only=<id>` 单独补回。

---

## 六、断网验收清单

1. Chrome DevTools → Network → 勾选 Offline，或直接在内网断 DNS
2. 遍历**全部路由与懒加载弹窗**（懒加载页面最容易漏）
3. 过滤 `unpkg / jsdelivr / cdnjs / googleapis / gstatic / iconify.design / api.cesium.com / bdimg.com / bdstatic.com` 等域名，应为 0 条
4. 检查 CSS 内 `url()` 的二级引用（字体、雪碧图）与路径大小写
5. 检查 Worker 是否加载：Monaco 写错 JSON 应出现校验波浪线，pdf.js 中文 PDF 不应乱码
6. 跑一遍 `check-offline.mjs`，退出码为 0

---

## 七、边界说明

- 本库分发开源组件静态资源与接入方法，**不包含任何地图瓦片数据、账号密钥或在线服务凭证**；离线百度方案包内的 API 脚本请按与地图服务方的授权约定使用。
- `catalog.json` 中的版本号于 2026-11-12 通过 npm 镜像核实；后续以实际锁定版本为准。
