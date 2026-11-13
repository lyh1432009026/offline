# pdf.js — 内网离线使用教程

> 所属分类：文档预览　|　版本：6.5.438　|　许可：Apache-2.0　|　资源体积：展开 14.4 MB / 下载包 3.0 MB · 100 个文件

PDF 预览，Worker 必须同源；6.x 的 npm 包已不含 cmaps 与 standard_fonts，处理中文 CID 字体时需另行补齐。

## 一、离线风险点

默认会请求的公网域名：`cdn.jsdelivr.net`、`unpkg.com`、`mozilla.github.io`

必须随包发布的文件：

- `build/pdf.mjs`
- `build/pdf.worker.mjs`
- `build/pdf.worker.min.mjs`
- `web/pdf_viewer.mjs`
- `web/pdf_viewer.css`

## 二、接入步骤

安装 / 部署：

```bash
cp -r vendor/pdfjs/6.5.438/{build,web} public/pdfjs/
```

### 1. 确认 worker 与主库版本一致

pdf.worker.mjs 必须与 pdf.mjs 来自同一个 npm 包。版本错配会直接抛错且难以定位，不要从别处单独下载 worker。

```
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/build/pdf.worker.mjs'
```

### 2. 按需补齐 cmaps 与标准字体

重要：pdfjs-dist 6.x 的 npm 包只含 build/ 与 web/ 的 viewer 文件，不含 cmaps/ 与 standard_fonts/。若只预览内部生成的文本型 PDF，可省略；若遇到中文 CID 字体乱码，需从 pdf.js 官方 prebuilt 发布包（GitHub Releases 的 pdfjs-*-dist.zip）取出这两个目录，放到 vendor/pdfjs/<版本>/web/ 下，再启用 cMapUrl 与 standardFontDataUrl。

```
getDocument({
  cMapUrl: "/pdfjs/web/cmaps/", cMapPacked: true,
  standardFontDataUrl: "/pdfjs/web/standard_fonts/"
})
```

### 3. 用 HTTP 服务而不是 file://

Worker 在 file:// 协议下会被浏览器当作跨源请求而拒绝。内网必须用 Nginx 或本地静态服务发布。

```
# 不要双击 index.html 调试 pdf.js
```

### 4. 按需裁剪

若只处理内部生成的 PDF，可评估去掉 legacy 构建、viewer 与 source map 等多余文件；按需补齐的 cmaps 目录不要漏拷。

```
public/pdfjs/
├── build/   (pdf.mjs + pdf.worker.mjs)
└── web/     (viewer；cmaps/ 与 standard_fonts/ 按需补齐)
```

## 三、推荐配置

```js
import * as pdfjsLib from "pdfjs-dist"
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url"

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

const task = pdfjsLib.getDocument({
  url: "/docs/demo.pdf"
  // 需处理 CID 字体时，先补齐 cmaps/ 与 standard_fonts/ 再启用：
  // cMapUrl: "/pdfjs/web/cmaps/", cMapPacked: true,
  // standardFontDataUrl: "/pdfjs/web/standard_fonts/"
})
const pdf = await task.promise
```

## 四、常见坑

- 只拷 pdf.mjs 不拷 worker，页面卡在 loading
- 中文 CID 字体乱码时，先确认是否已从官方 prebuilt 包补齐 cmaps（npm 包不含）
- .mjs 若被服务器返回 text/plain 会被 Strict MIME 拦截

## 五、断网验收

断网打开一份含中文的 PDF，文字可复制、无方框，Network 无外网域名。

## 六、资源包

- 下载：`vendor/pdfjs/pdfjs-6.5.438.tar.gz`（由 `node scripts/build-vendor.mjs --only=pdfjs` 生成）
- 来源：`pdfjs-dist@6.5.438`，npm 镜像 https://registry.npmmirror.com

---

返回 [教程索引](./INDEX.md)　|　[内网门户](../index.html)　|　清单更新日期 2026-11-12
