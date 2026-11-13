# wangEditor — 内网离线使用教程

> 所属分类：编辑器　|　版本：5.1.23　|　许可：MIT　|　资源体积：展开 6.9 MB / 下载包 2.0 MB · 22 个文件

国产富文本编辑器，npm 包本身完全离线，主要外链风险来自上传接口与自定义内容。

## 一、离线风险点

默认会请求的公网域名：无（纯本地包）

必须随包发布的文件：

- `dist/css/style.css`

## 二、接入步骤

安装 / 部署：

```bash
npm i @wangeditor/editor @wangeditor/editor-for-vue
```

### 1. 从私仓安装并引入样式

安装 editor 与 editor-for-vue 两个包，样式文件必须单独引入。整个包没有运行时 CDN 请求。

```
import '@wangeditor/editor/dist/css/style.css'
```

### 2. 配置内网上传

MENU_CONF.uploadImage.server 与 uploadVideo.server 改为内网地址，并按后端返回格式实现 customInsert 或调整响应结构。

```
MENU_CONF: { uploadImage: { server: '/api/upload' } }
```

### 3. 清理正文外链内容

历史数据里粘贴的公网图片、视频 iframe、字体链接清洗一遍，或由后端代理，否则页面仍会向外网发请求。

```
editorConfig.customPaste = (editor, event) => { /* 清洗后再插入 */ }
```

## 三、推荐配置

```js
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

const editorConfig = {
  MENU_CONF: {
    uploadImage: { server: '/api/upload', fieldName: 'file' }
  }
}
```

## 四、常见坑

- Vue 组件销毁时需调用 editor.destroy()
- @wangeditor/editor 与 editor-for-vue 版本需匹配

## 五、断网验收

断网新建、编辑、上传图片全流程可用，Network 仅本站域名。

## 六、资源包

- 下载：`vendor/wangeditor/wangeditor-5.1.23.tar.gz`（由 `node scripts/build-vendor.mjs --only=wangeditor` 生成）
- 来源：`@wangeditor/editor@5.1.23`，npm 镜像 https://registry.npmmirror.com

---

返回 [教程索引](./INDEX.md)　|　[内网门户](../index.html)　|　清单更新日期 2026-11-12
