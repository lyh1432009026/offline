# Vditor — 内网离线使用教程

> 所属分类：编辑器　|　版本：4.0.1　|　许可：MIT　|　资源体积：展开 21.9 MB / 下载包 5.6 MB · 530 个文件

浏览器端 Markdown 编辑器，默认从 unpkg 动态加载 Lute 引擎、i18n、主题与图标。

## 一、离线风险点

默认会请求的公网域名：`unpkg.com`、`cdn.jsdelivr.net`

必须随包发布的文件：

- `dist/index.css`
- `dist/js/lute/lute.min.js`
- `dist/js/i18n/zh_CN.js`
- `dist/js/highlight.js/*`
- `dist/images/*`

## 二、接入步骤

安装 / 部署：

```bash
cp -r vendor/vditor/4.0.1/dist public/vditor
```

### 1. 取出资源包并放到 public

在本库下载 vditor-4.0.1.tar.gz，解压后把整个 dist 目录拷到 Vue 项目的 public/vditor/。Vite 不会编译 public 下的文件，路径会原样保留，这一点必须保证。

```
public/
└── vditor/
    ├── index.css
    ├── js/lute/lute.min.js
    ├── js/i18n/zh_CN.js
    └── images/
```

### 2. 把 cdn 指到本地目录

cdn 的值是 dist 目录本身，不是其父目录。Vditor 会在此路径下自行拼接 js/lute/lute.min.js 等子路径。建议通过环境变量注入，方便内外网切换。

```
new Vditor('vditor', {
  cdn: import.meta.env.VITE_VDITOR_CDN || '/vditor'
})
```

### 3. 清理体积

dist 内含 Lute 引擎与流程图、思维导图、数学公式等模块源码，4.0.1 展开约 22 MB（下载包压缩后约 5.6 MB）。确认不用的模块可以删掉对应源码目录，并在 Nginx 开启 gzip 或 brotli。不要删 index.css 与 lute.min.js。

```
# nginx
location /vditor/ { gzip on; gzip_types text/css application/javascript; }
```

### 4. 收口其余外部请求

upload.url 改为内网上传接口；preview.hljs 主题的 CSS、preview.math 的 KaTeX、mermaid、emoji 图片都要指向本地；外链图片由后端代理或禁用。cache 走 localStorage，无网络依赖可保留。

```
preview: {
  hljs: { style: 'github' },
  math: { engine: 'KaTeX' },
  actions: []
}
```

## 三、推荐配置

```js
import Vditor from 'vditor'
import 'vditor/dist/index.css'

const editor = new Vditor('vditor', {
  height: 520,
  mode: 'ir',
  cdn: '/vditor',
  upload: { url: '/api/upload' },
  cache: { enable: true, id: 'draft' }
})
```

## 四、常见坑

- 漏拷 js/i18n/zh_CN.js 会导致编辑器白屏并提示远程加载失败
- cdn 路径写成 /vditor/dist 会重复拼接目录，导致 404
- 本地 cdn 的资源版本必须与 npm 安装的 vditor 版本一致

## 五、断网验收

断网后打开编辑器，DevTools Network 过滤 unpkg / jsdelivr 应为 0 条；输入 Markdown 能即时渲染。

## 六、资源包

- 下载：`vendor/vditor/vditor-4.0.1.tar.gz`（由 `node scripts/build-vendor.mjs --only=vditor` 生成）
- 来源：`vditor@4.0.1`，npm 镜像 https://registry.npmmirror.com

---

返回 [教程索引](./INDEX.md)　|　[内网门户](../index.html)　|　清单更新日期 2026-11-12
