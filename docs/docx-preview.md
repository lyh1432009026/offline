# docx-preview — 内网离线使用教程

> 所属分类：文档预览　|　版本：0.4.1　|　许可：Apache-2.0　|　资源体积：展开 0.9 MB / 下载包 0.2 MB · 10 个文件

在浏览器渲染 docx，npm 包本身离线，样式与字体需本地化。

## 一、离线风险点

默认会请求的公网域名：无（纯本地包）

必须随包发布的文件：

- `dist/docx-preview.min.js`

## 二、接入步骤

安装 / 部署：

```bash
npm i docx-preview@0.4.1
```

### 1. 安装并引入

从内网私仓安装，用 renderAsync 把 ArrayBuffer 渲染到容器。包本身不发起任何网络请求。

```
import { renderAsync } from 'docx-preview'
```

### 2. 补齐样式

渲染结果依赖默认样式表，若项目重置了全局 CSS，需要为容器补一套段落、表格、列表样式，否则版式会明显失真。

```
.docx-wrapper { background: #fff; padding: 24px; }
```

### 3. 处理文档内字体与图片

docx 内若引用了系统中不存在的字体，会回退导致换行变化；图片一般内嵌在包内，无需额外请求。内网机器建议预装常用中文字体。

```
/* 指定回退字体栈 */
.docx { font-family: 'SimSun', 'Microsoft YaHei', serif; }
```

### 4. 大文档加保护

几十页以上文档建议分片或加 loading 与超时，避免主线程长时间阻塞。

```
await Promise.race([renderAsync(buf, el), timeout(15000)])
```

## 三、推荐配置

```js
import { renderAsync } from 'docx-preview'

await renderAsync(arrayBuffer, container, null, {
  className: 'docx',
  inWrapper: true,
  ignoreWidth: false,
  experimental: true
})
```

## 四、常见坑

- 复杂域代码、批注、SmartArt 支持有限
- 全局 CSS reset 会破坏文档版式
- 文档内嵌的外链图片仍会产生外部请求

## 五、断网验收

断网上传并预览一份含表格与图片的 docx，渲染完成且 Network 无外网请求。

## 六、资源包

- 下载：`vendor/docx-preview/docx-preview-0.4.1.tar.gz`（由 `node scripts/build-vendor.mjs --only=docx-preview` 生成）
- 来源：`docx-preview@0.4.1`，npm 镜像 https://registry.npmmirror.com

---

返回 [教程索引](./INDEX.md)　|　[内网门户](../index.html)　|　清单更新日期 2026-11-12
