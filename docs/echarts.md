# ECharts — 内网离线使用教程

> 所属分类：图表渲染　|　版本：6.1.0　|　许可：Apache-2.0　|　资源体积：展开 50.7 MB / 下载包 10.2 MB · 23 个文件

图表库本身纯离线，风险在地图 GeoJSON、在线地图扩展与主题图片资源。

## 一、离线风险点

默认会请求的公网域名：`cdn.jsdelivr.net`、`api.map.baidu.com`

必须随包发布的文件：

- `dist/echarts.min.js`

## 二、接入步骤

安装 / 部署：

```bash
npm i echarts@6.1.0
```

### 1. 按需引入减小体积

使用 echarts/core + use() 注册所需图表与组件，避免全量包，也让构建产物完全自包含。

```
import * as echarts from 'echarts/core'
echarts.use([BarChart, GridComponent, CanvasRenderer])
```

### 2. 把 GeoJSON 放进内网

地图数据不要从公网接口拉取，把 JSON 放到 public/vendor/geo/ 下，启动前用 registerMap 注册。JSON 版本与展示口径由团队统一维护。

```
const geo = await fetch('/vendor/geo/china.json').then(r => r.json())
echarts.registerMap('china', geo)
```

### 3. 移除在线地图扩展

echarts/extension/bmap.js 会加载百度地图 JS API，echarts-gl 的部分示例也引用在线纹理。内网要么不用，要么改为本地已授权的地图服务。

```
// 不要 import 'echarts/extension/bmap'
```

### 4. 检查配置里的图片外链

graphic、series 的 symbol、markPoint 图标、自定义主题 JSON 中可能写死 https 图片地址，统一换成本地静态资源。

```
symbol: 'image:///assets/marker.png'
```

## 三、推荐配置

```js
import * as echarts from 'echarts/core'
import { BarChart, MapChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, GeoComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import chinaJson from '/vendor/geo/china.json'

echarts.use([BarChart, MapChart, GridComponent, TooltipComponent, GeoComponent, CanvasRenderer])
echarts.registerMap('china', chinaJson)
```

## 四、常见坑

- registerMap 前使用了 map 类型会报地图不存在
- GeoJSON 文件较大，注意 Nginx 是否允许 .json 的 MIME 与 gzip
- 散点坐标与底图坐标系不一致会造成整体偏移

## 五、断网验收

断网打开全部图表页，地图与图标正常，Network 无外网域名。

## 六、资源包

- 下载：`vendor/echarts/echarts-6.1.0.tar.gz`（由 `node scripts/build-vendor.mjs --only=echarts` 生成）
- 来源：`echarts@6.1.0`，npm 镜像 https://registry.npmmirror.com

---

返回 [教程索引](./INDEX.md)　|　[内网门户](../index.html)　|　清单更新日期 2026-11-12
