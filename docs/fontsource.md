# 自托管 Web 字体 — 内网离线使用教程

> 所属分类：图标字体　|　版本：5.3.0　|　许可：OFL-1.1　|　资源体积：展开 4.1 MB / 下载包 3.9 MB · 413 个文件

用 @fontsource 系列替代 Google Fonts 等字体 CDN，把 woff2 随构建产物一起发布。

## 一、离线风险点

默认会请求的公网域名：`fonts.googleapis.com`、`fonts.gstatic.com`

必须随包发布的文件：

- `400.css`
- `500.css`
- `700.css`
- `files/*`

## 二、接入步骤

安装 / 部署：

```bash
npm i @fontsource/inter
```

### 1. 用 npm 包替换字体 CDN 链接

删除 index.html 里所有 fonts.googleapis.com / fonts.gstatic.com 的 link 标签，改为在样式入口 import @fontsource 对应字重的 CSS。

```
import '@fontsource/inter/400.css'
```

### 2. 保证 woff2 随产物发布

构建器会自动处理 CSS 内的 url()。若手工放到 public，必须连 files/ 目录一起拷，保持 CSS 里的相对路径不变。

```
dist/assets/
├── index-abc.css
└── inter-latin-400-normal-xyz.woff2
```

### 3. 中文字体做子集化

中文字体动辄数 MB，切勿整包引入。优先使用系统字体栈；确需定制时用 fonttools pyftsubset 按项目字符集合裁出子集，再以 @font-face 本地引入。

```
pyftsubset SourceHanSansSC.ttf --text-file=chars.txt --flavor=woff2
```

### 4. 配置字体 MIME 与缓存

Nginx 为 .woff2 返回 font/woff2，跨源场景补 Access-Control-Allow-Origin；带 hash 的字体文件可长缓存。

```
types { font/woff2 woff2; }
```

## 三、推荐配置

```js
/* main.css */
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/inter/700.css';

:root { font-family: 'Inter', 'Microsoft YaHei', sans-serif; }
```

## 四、常见坑

- CSS 内 url() 指向的字体是二级引用，最容易漏拷
- 中文字体整包会拖慢首屏数秒
- Element Plus 等组件库自带图标字体，也要一并检查

## 五、断网验收

断网刷新，Network 过滤 googleapis / gstatic 为 0 条，字体渲染与联网时一致。

## 六、资源包

- 下载：`vendor/fontsource/fontsource-5.3.0.tar.gz`（由 `node scripts/build-vendor.mjs --only=fontsource` 生成）
- 来源：`@fontsource/inter@5.3.0`，npm 镜像 https://registry.npmmirror.com

---

返回 [教程索引](./INDEX.md)　|　[内网门户](../index.html)　|　清单更新日期 2026-11-12
