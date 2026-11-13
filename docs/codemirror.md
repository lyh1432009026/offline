# CodeMirror 6 — 内网离线使用教程

> 所属分类：编辑器　|　版本：6.0.2　|　许可：MIT　|　资源体积：展开 0.0 MB / 下载包 0.0 MB · 9 个文件

纯 ESM 代码编辑器，无运行时 CDN，是新建内网项目时最省事的编辑器选型。

## 一、离线风险点

默认会请求的公网域名：无（纯本地包）

必须随包发布的文件：

- 无额外静态资源，npm 包随构建产物发布即可

## 二、接入步骤

安装 / 部署：

```bash
npm i codemirror @codemirror/lang-javascript @codemirror/theme-one-dark
```

### 1. 按需安装模块

CodeMirror 6 拆包设计，基础包只含核心；语言支持、主题、搜索等都要显式安装。这正是它天然离线的来源——所有代码都在构建产物里。

```
npm i codemirror @codemirror/view @codemirror/state @codemirror/lang-javascript
```

### 2. 在 Vue 中管理生命周期

在 onMounted 创建 EditorView，在 onBeforeUnmount 调用 view.destroy()，避免路由切换后残留实例。

```
let view
onMounted(() => { view = new EditorView({ parent: el.value }) })
onBeforeUnmount(() => view?.destroy())
```

### 3. 自定义主题

用 EditorView.theme 写样式，不要用外链 CSS 主题包。这样连字体都走系统字体栈，彻底无外部请求。

```
const theme = EditorView.theme({ '&': { fontSize: '13px' } })
```

## 三、推荐配置

```js
import { EditorView, basicSetup } from 'codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'

new EditorView({
  doc: 'const a = 1',
  extensions: [basicSetup, javascript(), oneDark, EditorView.lineWrapping],
  parent: document.querySelector('#code')
})
```

## 四、常见坑

- 不装语言包就没有语法高亮，常被误认为离线失败
- 从 CodeMirror 5 迁移时 API 不兼容，5.x 的部分资源仍走 CDN

## 五、断网验收

断网打开编辑器，输入代码有高亮与括号匹配，Network 请求全部指向本站。

## 六、资源包

- 下载：`vendor/codemirror/codemirror-6.0.2.tar.gz`（由 `node scripts/build-vendor.mjs --only=codemirror` 生成）
- 来源：`codemirror@6.0.2`，npm 镜像 https://registry.npmmirror.com

---

返回 [教程索引](./INDEX.md)　|　[内网门户](../index.html)　|　清单更新日期 2026-11-12
