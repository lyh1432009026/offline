# 离线百度地图完整方案（Vue 3 / Vite）

一套可直接复用的内网离线地图方案，由**离线 API 脚本 + 本地模块/图片 + Vue 加载器与组件 + 坐标系工具 + 独立瓦片服务**五部分组成。

> 本包只含前端侧资产与接入方法。**瓦片数据不在包内**，由内网独立瓦片服务提供；密钥不内置，离线脚本从 `window.BMAP_AUTHENTIC_KEY` 读取。



---

## 一、架构与请求流向

```
Vue 页面
  └─ <BaiduMap> 组件
       └─ loadBaiduMap()  ← vue/baiduMap.js
            ├─ 注入 window.mapConfig（瓦片地址 / home 路径 / 图片后缀）
            ├─ 顺序加载 /map/js/baidu_map_offline_3.0.js   → 全局 BMap
            └─ 顺序加载 /map/js/AreaRestriction_min.js      → 全局 BMapLib
                 ├─ 模块与控件图片  → 同域 /map/modules/、/map/images/   （本地）
                 └─ 底图瓦片        → mapConfig.tiles_dir/{z}/{x}/{y}.jpg（内网瓦片服务）
```

关键点：离线 API 是老式全局脚本，**不能 import、不能被 Vite 预构建转译**，必须用 `<script>` 标签执行；所有资源放 `public/map/` 由 Vite 原样静态提供。

---

## 二、目录结构

| 路径                                | 内容                           | 部署位置                       |
| --------------------------------- | ---------------------------- | -------------------------- |
| `map/js/baidu_map_offline_3.0.js` | 离线百度地图 API 3.0（约 389 KB）     | `public/map/js/`           |
| `map/js/AreaRestriction_min.js`   | 视野限制扩展库，依赖 BMapLib           | `public/map/js/`           |
| `map/js/map-config.js`            | **历史遗留文件**，运行时不生效，见下方说明      | 保留即可，不要改                   |
| `map/modules/`                    | 41 个功能模块（标注、多边形、控件、检索等）      | `public/map/modules/`      |
| `map/images/`                     | 控件图标、标注、信息窗图片                | `public/map/images/`       |
| `vue/baiduMap.js`                 | 幂等加载器，注入 `window.mapConfig`  | `src/utils/`               |
| `vue/BaiduMap.vue`                | 通用地图组件（标注 / 多边形 / 事件 / 视野适配） | `src/components/BaiduMap/` |
| `vue/coordTransform.js`           | WGS84 → GCJ02 → BD09 纯前端转换   | `src/utils/`               |
| `config/.env.example`             | 瓦片地址环境变量示例                   | 项目根目录                      |
| `config/vite.proxy.snippet.js`    | 开发期瓦片代理片段                    | `vite.config.js`           |
| `tiles/README.md`                 | 瓦片服务目录约定与 Nginx 配置           | 瓦片服务机                      |

---

## 三、四步接入

### 1. 放置静态资源

```bash
# 解压资源包，把 map/ 整个目录放到业务项目的 public/ 下
cp -r map public/map
```

最终路径必须是 `public/map/js/baidu_map_offline_3.0.js`。如果应用部署在子路径（如 `/admin/`），`mapConfig.home` 要同步改成 `/admin/map/`。

### 2. 放置 Vue 代码

```bash
cp vue/baiduMap.js        src/utils/baiduMap.js
cp vue/coordTransform.js  src/utils/coordTransform.js
cp vue/BaiduMap.vue       src/components/BaiduMap/index.vue
```

`BaiduMap.vue` 里用了 `@/utils/baiduMap` 别名，若项目别名不同请调整 import。

### 3. 配置瓦片服务地址

推荐用**同域相对路径 + 反向代理**，避免跨域、硬编码 IP 和混合内容：

```bash
cp config/.env.example .env.production.local
# VITE_APP_MAP_TILES_URL = '/map-tiles'
```

把 `config/vite.proxy.snippet.js` 里的 `/map-tiles` 代理规则合并到 `vite.config.js` 的 `server.proxy`；生产环境在 Nginx 上加同前缀的 `location` 转发到内网瓦片服务（见 `tiles/README.md`）。

也可以直接指向绝对地址：`VITE_APP_MAP_TILES_URL = 'http://<瓦片服务地址>:<端口>/map'`。

### 4. 在页面中使用

```vue
<script setup>
import BaiduMap from '@/components/BaiduMap/index.vue'
import { wgs84ToBd09, transformRings } from '@/utils/coordTransform'

// 业务数据多为 WGS84 / CGCS2000，必须先转 BD09，否则整体偏移约 500m~1km
const [lng, lat] = wgs84ToBd09(117.0884, 36.2003)
const markers = [{ lng, lat, name: '示例点位' }]
const polygons = [{ name: '区域 A', points: transformRings(rings) }]
</script>

<template>
  <BaiduMap :center="[lng, lat]" :zoom="12" :markers="markers" :polygons="polygons"
            @marker-click="onMarkerClick" @polygon-click="onPolygonClick" />
</template>
```

组件 props：`center` / `zoom` / `minZoom` / `maxZoom` / `scrollWheel` / `markers` / `polygons`；事件：`ready` / `map-click` / `marker-click` / `polygon-click`；暴露方法：`getMap` / `setCenter` / `setZoom` / `clearOverlays` / `fitToPolygons` / `fitBounds` / `setBounds`。

---

## 四、`window.mapConfig` 参数

由 `vue/baiduMap.js` 初始化，**这是唯一生效的配置源**。

| 字段             | 示例           | 说明                                             |
| -------------- | ------------ | ---------------------------------------------- |
| `imgext`       | `.jpg`       | 瓦片文件后缀，必须与瓦片服务实际文件一致                           |
| `tiles_dir`    | `/map-tiles` | 底图瓦片根地址，拼接规则 `{tiles_dir}/{z}/{x}/{y}{imgext}` |
| `tiles_hybrid` | `''`         | 卫星图层，离线置空                                      |
| `tiles_self`   | `''`         | 自定义图层，离线置空                                     |
| `home`         | `/map/`      | 模块与控件图片的本地根路径                                  |

> **易踩坑**：`map/js/map-config.js` 是历史遗留文件，里面 `tiles_hybrid` / `tiles_self` 仍指向 `api0.map.bdimg.com`，`imgext` 是 `.png`。运行时 `window.mapConfig` 已由加载器覆盖，**改这个文件不会生效**。要改配置请改 `vue/baiduMap.js` 或 `.env`。

---

## 五、坐标系

离线百度底图是 **BD09**。业务数据（GeoJSON 围栏、GPS 采集点）通常是 WGS84 或 CGCS2000（EPSG:4490，厘米级差异可按 WGS84 处理），必须转换：

| 函数                       | 用途                              |
| ------------------------ | ------------------------------- |
| `wgs84ToGcj09(lng, lat)` | WGS84 → 火星坐标                    |
| `gcj02ToBd09(lng, lat)`  | 火星坐标 → 百度                       |
| `wgs84ToBd09(lng, lat)`  | 业务统一入口                          |
| `transformRings(rings)`  | 批量转换 Polygon / MultiPolygon 坐标环 |

离线环境下百度官方 `geoconv` 在线转换不可用，所以必须本地换算。该算法为业界公开的近似实现，偏差约 1~2 米，满足围栏/标注显示，**不可用于测绘确权等高精度场景**。境外坐标原样返回。

---

## 六、功能边界（重要）

离线脚本内部仍保留了在线默认地址，因此：

| 可用（已本地化）               | 不可用 / 需另行处理（会请求公网）                         |
| ---------------------- | ------------------------------------------ |
| 底图瓦片（`tiles_dir` 覆盖）   | 自定义地图样式 mapstyle（`api.map.baidu.com/api` ） |
| 功能模块（`home=/map/`）     | 地名检索、地理编码、路径规划（`gsp0.baidu.com`）           |
| 控件图片（`map/images/`）    | 全景、卫星图层、实时路况                               |
| 标注、多边形、信息窗、事件          | 官方在线坐标转换 convertor                         |
| 视野限制 `AreaRestriction` | 脚本内 `ss*.bdstatic.com` 静态资源兜底              |

脚本内出现的域名：`api0/online0-4.map.bdimg.com`、`gsp0.baidu.com`、`ss0-3.bdstatic.com`、`lbsyun.baidu.com`、`static.tieba.baidu.com`。**断网验收时逐个过滤这些域名，应无请求；若有，说明触发了未离线化的功能。**

---

## 七、密钥与版权

- 离线 API 通过 `window.BMAP_AUTHENTIC_KEY` 读取密钥，**包内无硬编码 AK**，纯离线模式无需鉴权。若私有化 SDK 要求鉴权，请由后端注入，前端不要写明文 AK；在线服务按官网流程自行申请并配置 Referer 白名单。
- 早期实现曾隐藏版权控件（`.BMap_cpyCtrl` / `.anchorBL`）；本方案**默认保留显示**，请按与地图服务方的授权约定决定是否调整。
- 瓦片数据的来源、使用范围与更新由部署方自行负责，本包不分发任何瓦片数据。

---

## 八、断网验收

1. DevTools → Network 勾 Offline（或直接断 DNS），刷新地图页。
2. 确认请求全部指向本站或内网瓦片服务；过滤 `bdimg.com` / `baidu.com` / `bdstatic.com` 应为 0 条。
3. 缩放、拖拽、标注、多边形点击、`fitToPolygons` 均正常；控制台无 `BMap` 未定义、无 404。
4. 用 `wgs84ToBd09` 转换后的点位与底图道路对齐（不偏移 500m 以上）。
5. 若瓦片 404：检查 `imgext`（jpg/png）、`{z}/{x}/{y}` 目录层级、`home` 前缀与部署子路径。

---

## 九、通用化说明

1. `vue/baiduMap.js`：默认瓦片地址统一为同域相对路径 `/map-tiles`，并补充三种配置方式说明。
2. `vue/BaiduMap.vue`：移除隐藏版权控件的两条 CSS 规则，默认显示。

其余文件（离线 API、41 个 modules、图片、`coordTransform.js`）为方案自带资产，接入时无需改动。
