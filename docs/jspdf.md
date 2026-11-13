# jsPDF 中文字体 — 内网离线使用教程

> 所属分类：文档预览　|　版本：4.2.1　|　许可：MIT　|　资源体积：展开 28.7 MB / 下载包 3.8 MB · 15 个文件

前端 PDF 导出，内置字体不含中文，必须内嵌 TTF 字体子集。

## 一、离线风险点

默认会请求的公网域名：`cdnjs.cloudflare.com`、`fonts.gstatic.com`

必须随包发布的文件：

- `dist/jspdf.umd.min.js`

## 二、接入步骤

安装 / 部署：

```bash
npm i jspdf@4.2.1
```

### 1. 制作中文字体子集

jsPDF 只接受 TTF 并以 base64 注册。用 fonttools 按项目实际字符集合裁出子集，避免把几 MB 的完整字体打进前端包。

```
pyftsubset SourceHanSansSC.ttf --text-file=chars.txt --output-file=cn-subset.ttf
```

### 2. 转 base64 并在构建期引入

把 TTF 转成一个导出 base64 字符串的 JS 模块，或由构建器以 ?raw / asset 方式引入。不要运行时再去 fetch 公网字体。

```
base64 -w0 cn-subset.ttf > cn-subset.b64
```

### 3. 注册字体后输出

addFileToVFS → addFont → setFont 三步顺序不能颠倒，否则中文仍是乱码或空白。

```
doc.addFileToVFS('cn.ttf', b64); doc.addFont('cn.ttf','cn','normal'); doc.setFont('cn')
```

### 4. html2canvas 组合的注意事项

若用 html2canvas 截图再转 PDF，页面里的跨域图片会污染 canvas。把所有图片改为同源或 data URL。

```
html2canvas(el, { useCORS: false, backgroundColor: '#fff' })
```

## 三、推荐配置

```js
import { jsPDF } from 'jspdf'
import fontB64 from '/vendor/fonts/SourceHanSansSC-subset.b64.js'

const doc = new jsPDF()
doc.addFileToVFS('cn.ttf', fontB64)
doc.addFont('cn.ttf', 'cn', 'normal')
doc.setFont('cn')
doc.text('中文标题', 10, 20)
doc.save('report.pdf')
```

## 四、常见坑

- WOFF/WOFF2 不能直接注册，必须是 TTF
- 字体子集缺字会导出空白字符
- 未设置 setFont 时中文显示为乱码

## 五、断网验收

断网导出 PDF，用阅读器打开确认中文正常且文字可检索。

## 六、资源包

- 下载：`vendor/jspdf/jspdf-4.2.1.tar.gz`（由 `node scripts/build-vendor.mjs --only=jspdf` 生成）
- 来源：`jspdf@4.2.1`，npm 镜像 https://registry.npmmirror.com

---

返回 [教程索引](./INDEX.md)　|　[内网门户](../index.html)　|　清单更新日期 2026-11-12
