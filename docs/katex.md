# KaTeX — 内网离线使用教程

> 所属分类：图表渲染　|　版本：0.19.1　|　许可：MIT　|　资源体积：展开 2.8 MB / 下载包 1.2 MB · 84 个文件

数学公式渲染，CSS 依赖同目录 fonts/，只拷 CSS 会缺符号。

## 一、离线风险点

默认会请求的公网域名：`cdn.jsdelivr.net`、`cdnjs.cloudflare.com`

必须随包发布的文件：

- `dist/katex.min.css`
- `dist/katex.min.js`
- `dist/fonts/*`

## 二、接入步骤

安装 / 部署：

```bash
cp -r vendor/katex/0.19.1/dist public/vendor/katex
```

### 1. 整目录拷贝

katex.min.css 内以 url(fonts/KaTeX_Main-Regular.woff2) 引用同级 fonts 目录，必须连同 fonts/ 一起发布，且保持相对层级。

```
public/vendor/katex/
├── katex.min.css
├── katex.min.js
└── fonts/  (不可省略)
```

### 2. 通过 npm 引入更省心

Vite 项目直接 import 'katex/dist/katex.min.css'，构建器会自动把字体打进产物；手工放 public 时才需要自己保证目录结构。

```
import 'katex/dist/katex.min.css'
```

### 3. 与编辑器扩展对齐

Vditor / md-editor-v3 的公式扩展若单独指向 vendor 下的 KaTeX，要保证与主应用版本一致，避免两套字体与 CSS 冲突。

```
editorExtensions: { katex: { css: '/vendor/katex/katex.min.css' } }
```

## 三、推荐配置

```js
import katex from 'katex'
import 'katex/dist/katex.min.css'

const html = katex.renderToString('E = mc^2', {
  throwOnError: false,
  output: 'html'
})
```

## 四、常见坑

- 漏拷 fonts/ 时普通字符正常但数学符号显示异常
- woff2/ttf MIME 未配置会被浏览器拒绝加载
- output: 'mathml' 与 'html' 的字体依赖不同

## 五、断网验收

断网渲染含积分、矩阵、希腊字母的公式，符号完整无方框。

## 六、资源包

- 下载：`vendor/katex/katex-0.19.1.tar.gz`（由 `node scripts/build-vendor.mjs --only=katex` 生成）
- 来源：`katex@0.19.1`，npm 镜像 https://registry.npmmirror.com

---

返回 [教程索引](./INDEX.md)　|　[内网门户](../index.html)　|　清单更新日期 2026-11-12
