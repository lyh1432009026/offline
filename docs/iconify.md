# Iconify 离线图标集 — 内网离线使用教程

> 所属分类：图标字体　|　版本：1.2.10　|　许可：MIT（各图标集许可见其自身声明）　|　资源体积：展开 1.1 MB / 下载包 0.3 MB · 9 个文件

@iconify/vue 的 Icon 组件默认在线请求 api.iconify.design，需注册本地图标集才能离线。

## 一、离线风险点

默认会请求的公网域名：`api.iconify.design`、`api.simplesvg.com`、`api.unisvg.com`

必须随包发布的文件：

- `icons.json`
- `info.json`

## 二、接入步骤

安装 / 部署：

```bash
npm i -D @iconify-json/ri（只装用到的图标集）
```

### 1. 只装用得到的图标集

按项目实际图标前缀安装 @iconify-json/ri、@iconify-json/mdi 等。不要装 @iconify/json 全量包（约 130 MB），内网传输与构建都很不划算。

```
npm i -D @iconify-json/ri @iconify-json/line-md
```

### 2. 在入口注册本地集合

新建 iconify-loader.ts，用 addCollection 逐个注册，并在 main.ts 第一行引入，保证任何图标渲染前已完成注册。

```
import { addCollection } from '@iconify/vue'
import riIcons from '@iconify-json/ri/icons.json'
addCollection(riIcons)
```

### 3. 或用构建期内联

unplugin-icons 会把用到的图标在构建时转成组件，运行时零请求、零图标数据，是更彻底的方案；代价是图标名必须写成静态字符串。

```
import IconHome from '~icons/ri/home-line'
```

### 4. 核对图标前缀

图标名前缀必须与注册的集合 prefix 一致，拼错时组件会再次尝试在线查找，离线环境表现为图标空白。

```
<Icon icon="ri:home-line" />
```

## 三、推荐配置

```js
import { addCollection, Icon } from '@iconify/vue'
import riIcons from '@iconify-json/ri/icons.json'

addCollection(riIcons)
// 之后 <Icon icon="ri:home-line" /> 不再发起网络请求
```

## 四、常见坑

- 动态拼接的图标名无法被构建期方案识别
- 新增图标集后需重新注册并重启开发服务
- 混用在线与离线图标时很难从现象上区分问题来源

## 五、断网验收

断网后打开含图标页面，Network 过滤 iconify.design 应为 0 条，图标全部显示。

## 六、资源包

- 下载：`vendor/iconify/iconify-1.2.10.tar.gz`（由 `node scripts/build-vendor.mjs --only=iconify` 生成）
- 来源：`@iconify-json/ri@1.2.10`，npm 镜像 https://registry.npmmirror.com

---

返回 [教程索引](./INDEX.md)　|　[内网门户](../index.html)　|　清单更新日期 2026-11-12
