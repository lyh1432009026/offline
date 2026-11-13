# md-editor-v3 — 内网离线使用教程

> 所属分类：编辑器　|　版本：7.1.0　|　许可：MIT　|　资源体积：展开 0.6 MB / 下载包 0.1 MB · 40 个文件

Vue 3 Markdown 编辑器，代码高亮、公式、流程图等扩展默认从公网 CDN 拉取。

## 一、离线风险点

默认会请求的公网域名：`cdn.jsdelivr.net`、`unpkg.com`

必须随包发布的文件：

- `lib/style.css`
- `lib/preview.css`

## 二、接入步骤

安装 / 部署：

```bash
npm i md-editor-v3@7.1.0（内网私仓）
```

### 1. 安装并引入本地样式

从内网 npm 私仓安装固定版本，入口文件同时引入 lib/style.css。只装 JS 不引 CSS 会表现为工具栏错乱。

```
import 'md-editor-v3/lib/style.css'
import { MdEditor } from 'md-editor-v3'
```

### 2. 用 config 覆盖扩展地址

在 main.ts 中、挂载应用之前调用 config()，把 highlight、katex、mermaid、prettier 等扩展的 js/css 全部指向内网 vendor 路径。这一步是离线化的关键。

```
import { config } from 'md-editor-v3'
config({ editorExtensions: { /* 全部本地路径 */ } })
```

### 3. 用不到就关掉扩展

如果业务不需要公式或流程图，通过 noMermaid、noKatex 之类的开关直接禁用，比本地化这些大块资源更省事，也减少动态 import 的 chunk 缺失风险。

```
<MdEditor v-model="text" :noMermaid="true" />
```

### 4. 处理上传与图片

onUploadImg 回调改为内网上传接口；正文中的外链图片由后端代理抓取，避免页面在离线环境产生 ERR_NAME_NOT_RESOLVED。

```
const onUploadImg = async (files, callback) => {
  const urls = await Promise.all(files.map(uploadToIntranet))
  callback(urls)
}
```

## 三、推荐配置

```js
import { config } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

config({
  editorExtensions: {
    highlight: { js: '/vendor/highlight.js/highlight.min.js' },
    katex: {
      js: '/vendor/katex/katex.min.js',
      css: '/vendor/katex/katex.min.css'
    }
  }
})
```

## 四、常见坑

- config() 必须在组件渲染前调用，放在 onMounted 里无效
- 扩展 JS 的版本要与编辑器期望的 API 兼容，跨大版本容易报错
- 主题 CSS 与代码块高亮 CSS 不是同一个文件，两者都要本地引入

## 五、断网验收

断网后预览一段含代码块与公式的 Markdown，高亮与公式均正常，Network 无 jsdelivr 请求。

## 六、资源包

- 下载：`vendor/md-editor-v3/md-editor-v3-7.1.0.tar.gz`（由 `node scripts/build-vendor.mjs --only=md-editor-v3` 生成）
- 来源：`md-editor-v3@7.1.0`，npm 镜像 https://registry.npmmirror.com

---

返回 [教程索引](./INDEX.md)　|　[内网门户](../index.html)　|　清单更新日期 2026-11-12
