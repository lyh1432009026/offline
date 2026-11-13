# Monaco Editor — 内网离线使用教程

> 所属分类：编辑器　|　版本：0.57.0　|　许可：MIT　|　资源体积：展开 24.4 MB / 下载包 5.5 MB · 152 个文件

VS Code 同款代码编辑器，loader 默认从 CDN 加载 min/vs 与各类语言 Worker。

## 一、离线风险点

默认会请求的公网域名：`cdn.jsdelivr.net`、`unpkg.com`

必须随包发布的文件：

- `min/vs/loader.js`
- `min/vs/editor/editor.main.js`
- `min/vs/editor/editor.main.css`
- `min/vs/editor/editor.worker.js`
- `min/vs/assets/*.worker*.js`
- `min/vs/language/*`
- `min/vs/basic-languages/*`

## 二、接入步骤

安装 / 部署：

```bash
cp -r vendor/monaco-editor/0.57.0/min/vs public/monaco/vs
```

### 1. 整包拷贝 min/vs

Monaco 的 loader.js 会按相对路径继续加载 editor.main.js、CSS、各语言贡献点与 Worker，因此必须整包拷贝，单独下载 Cesium.js 式的单文件做法在这里必然报错。

```
public/monaco/vs/
├── loader.js
├── editor/editor.main.js
├── editor/editor.worker.js
├── assets/*.worker*.js
├── language/
└── basic-languages/
```

### 2. Vite 工程用 ESM + ?worker

推荐用 monaco-editor 的 ESM 入口配合 Vite 的 ?worker 导入，让构建器把 Worker 一起打进产物，避免运行时路径问题。需要哪种语言就注册哪种 Worker。

```
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
```

### 3. 非构建场景改 loader 路径

若用原生 script 引入，加载 loader.js 后调用 loader.config 指定 vs 目录。注意 0.5x 起 min/vs 内是带 hash 的 ESM chunk（Worker 形如 assets/editor.worker-XXXX.js），旧教程里的 base/worker/workerMain.js 已不存在；手写 getWorkerUrl 需指向带 hash 的文件且升级即失效，因此内网优先采用上一步的 Vite ?worker 方案。Worker 不能跨源，也不能用 file:// 打开。

```
monaco.loader.config({ paths: { vs: "/monaco/vs" } })
// Worker 示例：/monaco/vs/assets/editor.worker-_vAIFJDs.js
```

### 4. 裁剪语言包

只保留项目实际用到的语言目录（如 json、typescript、css），可以显著减小发布体积。裁剪后务必验证对应语言的补全与校验仍然可用。

```
# 保留
vs/language/json/  vs/language/typescript/  vs/basic-languages/
```

## 三、推荐配置

```js
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') return new jsonWorker()
    return new editorWorker()
  }
}
monaco.editor.create(document.getElementById('code'), { value: '', language: 'json' })
```

## 四、常见坑

- Worker 路径或版本不匹配时编辑器能打开但没有语法校验，容易被误判为正常
- CSS 内的字体与图标相对路径要一起保留
- Nginx 需为 .js/.css/.ttf 返回正确 MIME，否则 Worker 加载被 Strict MIME 拦截

## 五、断网验收

断网打开 JSON 编辑器，故意写错一个逗号应出现校验波浪线；Network 无外网域名。

## 六、资源包

- 下载：`vendor/monaco-editor/monaco-editor-0.57.0.tar.gz`（由 `node scripts/build-vendor.mjs --only=monaco-editor` 生成）
- 来源：`monaco-editor@0.57.0`，npm 镜像 https://registry.npmmirror.com

---

返回 [教程索引](./INDEX.md)　|　[内网门户](../index.html)　|　清单更新日期 2026-11-12
