# Mermaid — 内网离线使用教程

> 所属分类：图表渲染　|　版本：12.3.0　|　许可：MIT　|　资源体积：展开 117.9 MB / 下载包 24.7 MB · 1402 个文件

流程图/时序图渲染，现代版本会动态 import 多个 chunk，容易漏发布。

## 一、离线风险点

默认会请求的公网域名：`cdn.jsdelivr.net`、`unpkg.com`

必须随包发布的文件：

- `dist/mermaid.esm.min.mjs`
- `dist/chunks/**`

## 二、接入步骤

安装 / 部署：

```bash
npm i mermaid@12.3.0
```

### 1. 走构建器而不是 CDN

从 npm 安装并用 ESM 引入，让 Vite 处理动态 import。若手工拷贝 dist，务必把 chunks/ 目录一起发布，否则运行时会 404。

```
dist/
├── mermaid.esm.min.mjs
└── chunks/mermaid.core/…  (必须一起)
```

### 2. 关闭自动扫描

建议 startOnLoad: false，由业务代码在内容就绪后显式调用 render，避免路由切换时重复渲染或找不到容器。

```
mermaid.initialize({ startOnLoad: false })
```

### 3. 固定 base 路径

内网部署在子路径时，Vite 的 base 必须与实际访问路径一致，否则动态 chunk 会拼到根路径去。

```
export default defineConfig({ base: '/offline-hub/' })
```

### 4. 检查字体与图标

部分主题引用外部字体与图标资源，统一改为本地或系统字体；自定义主题 CSS 也要放进产物。

```
themeVariables: { fontFamily: 'Microsoft YaHei, sans-serif' }
```

## 三、推荐配置

```js
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'strict',
  theme: 'default'
})
const { svg } = await mermaid.render('graph-1', 'graph TD; A-->B')
```

## 四、常见坑

- 只发主文件不发 chunk 是最常见的离线失败原因
- render() 的 id 重复会导致 SVG 覆盖
- securityLevel 设为 loose 时需评估注入风险

## 五、断网验收

断网渲染流程图与时序图，SVG 正常且 Network 全部指向本站。

## 六、资源包

- 下载：`vendor/mermaid/mermaid-12.3.0.tar.gz`（由 `node scripts/build-vendor.mjs --only=mermaid` 生成）
- 来源：`mermaid@12.3.0`，npm 镜像 https://registry.npmmirror.com

---

返回 [教程索引](./INDEX.md)　|　[内网门户](../index.html)　|　清单更新日期 2026-11-12
