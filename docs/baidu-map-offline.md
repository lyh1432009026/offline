# 离线百度地图完整方案 — 内网离线使用教程

> 所属分类：完整方案　|　版本：1.0.0　|　许可：按地图服务方授权条款　|　资源体积：展开 1.2 MB / 下载包 0.4 MB · 83 个文件

可直接部署的全套离线方案：离线 API 3.0 脚本 + 41 个模块 + Vue 加载器/组件 + WGS84→BD09 坐标转换 + 瓦片服务约定。瓦片数据由内网服务提供，包内不含。

## 一、离线风险点

默认会请求的公网域名：`api0.map.bdimg.com`、`gsp0.baidu.com`、`ss0.bdstatic.com`、`lbsyun.baidu.com`

必须随包发布的文件：

- `map/js/baidu_map_offline_3.0.js`
- `map/js/AreaRestriction_min.js`
- `map/modules/（41 个）`
- `map/images/（控件与标注图片）`
- `vue/baiduMap.js`
- `vue/BaiduMap.vue`
- `vue/coordTransform.js`
- `config/.env.example`
- `config/vite.proxy.snippet.js`
- `tiles/README.md`

## 二、接入步骤

安装 / 部署：

```bash
解压 baidu-map-offline-1.0.0.tar.gz → map/ 放到 public/map，vue/ 三个文件放到 src/，config/ 合并到项目配置
```

### 1. 放置静态资源

把包内 map/ 整个目录拷到业务项目的 public/map/，最终路径必须是 public/map/js/baidu_map_offline_3.0.js。离线 API 是老式全局脚本，不能 import、不能被 Vite 预构建转译，必须由加载器用 script 标签执行。若应用部署在子路径（如 /admin/），mapConfig.home 要同步改成 /admin/map/。

```
public/
└── map/
    ├── js/baidu_map_offline_3.0.js
    ├── js/AreaRestriction_min.js
    ├── modules/   (41 个)
    └── images/
```

### 2. 放置 Vue 代码

把 vue/ 下三个文件放到 src/utils/ 与 src/components/BaiduMap/。BaiduMap.vue 内使用 @/utils/baiduMap 别名，项目别名不同时改这一行 import。组件支持 center/zoom/markers/polygons 等 props，抛出 ready、map-click、marker-click、polygon-click 事件，并暴露 getMap、setCenter、fitToPolygons、setBounds 等方法。

```
cp vue/baiduMap.js        src/utils/baiduMap.js
cp vue/coordTransform.js  src/utils/coordTransform.js
cp vue/BaiduMap.vue       src/components/BaiduMap/index.vue
```

### 3. 配置瓦片服务地址

瓦片不在包内，由内网独立服务提供，拼接规则为 {tiles_dir}/{z}/{x}/{y}{imgext}。推荐用同域相对路径 /map-tiles 加反向代理，避免跨域、硬编码 IP 与混合内容；也可用 .env 的 VITE_APP_MAP_TILES_URL 直接指向内网服务。包内 config/ 提供了 .env 示例与 Vite 代理片段，tiles/README.md 提供 Nginx 转发配置。

```
# .env.production
VITE_APP_MAP_TILES_URL = '/map-tiles'

# vite.config.js（开发期）
'/map-tiles': { target: 'http://瓦片服务:端口', changeOrigin: true,
                 rewrite: p => p.replace(/^\/map-tiles/, '/map') }
```

### 4. 统一坐标系到 BD09

离线百度底图为 BD09，而业务围栏 GeoJSON、GPS 采集点通常是 WGS84 / CGCS2000（厘米级差异可按 WGS84 处理）。不转换会整体偏移约 500m~1km。离线环境百度官方在线 geoconv 不可用，必须用包内 coordTransform.js 本地换算。该近似算法偏差约 1~2 米，满足展示，不可用于测绘确权。

```
import { wgs84ToBd09, transformRings } from "@/utils/coordTransform"
const [lng, lat] = wgs84ToBd09(117.0884, 36.2003)
const bdRings = transformRings(geojsonRings)
```

### 5. 核对配置源与功能边界

window.mapConfig 由 vue/baiduMap.js 注入，是唯一生效的配置源；map/js/map-config.js 是历史遗留文件，里面仍写着 .png 与 api0.map.bdimg.com，改它不生效。自定义地图样式、地名检索、地理编码、全景、卫星图层在离线环境仍会请求公网，属于不可用功能，业务侧要禁用入口。

```
window.mapConfig = {
  imgext: ".jpg", tiles_dir: "/map-tiles",
  tiles_hybrid: "", tiles_self: "", home: "/map/"
}
```

### 6. 断网验收

断网或断 DNS 后刷新地图页，逐个过滤脚本内残留的在线域名；缩放拖拽、标注点击、多边形点击、视野适配均应正常。瓦片 404 时按 imgext 后缀、目录层级、home 前缀三项排查。完整部署说明见包内 README.md。

```
过滤：bdimg.com / baidu.com / bdstatic.com / lbsyun.baidu.com
期望：0 条请求，控制台无 BMap 未定义、无 404
```

## 三、推荐配置

```js
// 1) 页面里直接用封装好的组件与坐标工具
import BaiduMap from "@/components/BaiduMap/index.vue"
import { wgs84ToBd09, transformRings } from "@/utils/coordTransform"

// 2) 业务数据多为 WGS84 / CGCS2000，先转 BD09 再上图
const [lng, lat] = wgs84ToBd09(117.0884, 36.2003)
const markers = [{ lng, lat, name: "示例点位" }]
const polygons = [{ name: "区域 A", points: transformRings(rings) }]

// 3) 加载器 vue/baiduMap.js 会注入 window.mapConfig 并按序加载离线脚本
//    tiles_dir 由 VITE_APP_MAP_TILES_URL 配置，默认同域 /map-tiles
// <BaiduMap :center="[lng, lat]" :zoom="12" :markers="markers" :polygons="polygons" />
```

## 四、常见坑

- map/js/map-config.js 是遗留文件，运行时被 window.mapConfig 覆盖，改它不生效
- 离线 API 不能用 import / 不能被 Vite 预构建，必须 script 标签顺序加载（API 在 AreaRestriction 之前）
- WGS84 未转 BD09 直接上图，会整体偏移约 500m~1km；境外坐标工具会原样返回
- 部署在子路径时 home 未同步修改，会导致 modules 与 images 全部 404
- 自定义样式、检索、地理编码、全景、卫星图层仍指向公网，离线环境会发无效请求
- 瓦片 404 最常见原因：imgext 与实际后缀不符（jpg/png）、{z}/{x}/{y} 层级不一致、HTTPS 页面引用 HTTP 瓦片
- 方案默认保留版权控件显示，请按与地图服务方的授权约定决定是否调整

## 五、断网验收

断网刷新地图页，Network 过滤 bdimg.com / baidu.com / bdstatic.com 为 0 条；瓦片全部 200；缩放、标注与多边形点击正常；wgs84ToBd09 转换后的点位与底图道路对齐。

## 六、资源包

- 下载：`vendor/baidu-map-offline/baidu-map-offline-1.0.0.tar.gz`（由 `node scripts/build-vendor.mjs --only=baidu-map-offline` 生成）
- 来源：本地方案目录 `solutions/baidu-map`（非 npm，脚本直接打包目录）
- 完整部署文档：`solutions/baidu-map/README.md`

---

返回 [教程索引](./INDEX.md)　|　[内网门户](../index.html)　|　清单更新日期 2026-11-12
