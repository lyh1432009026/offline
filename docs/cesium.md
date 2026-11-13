# CesiumJS — 内网离线使用教程

> 所属分类：三维地图　|　版本：1.147.0　|　许可：Apache-2.0　|　资源体积：展开 21.8 MB / 下载包 8.2 MB · 346 个文件

三维地球，默认依赖 ion、在线影像与 Geocoder；离线需整包本地化并替换四个联网模块。

## 一、离线风险点

默认会请求的公网域名：`api.cesium.com`、`dev.virtualearth.net`、`cdn.jsdelivr.net`

必须随包发布的文件：

- `Build/Cesium/Cesium.js`
- `Build/Cesium/Workers/*`
- `Build/Cesium/Assets/*`
- `Build/Cesium/Widgets/*`
- `Build/Cesium/ThirdParty/*`

## 二、接入步骤

安装 / 部署：

```bash
cp -r vendor/cesium/1.147.0/Build/Cesium public/cesium
```

### 1. 整包拷贝 Build/Cesium

Workers、Assets、Widgets、ThirdParty 都会被运行时按需加载，必须整包发布。只拷 Cesium.js 会因为缺少 Worker 与资源文件直接崩溃。

```
public/cesium/
├── Cesium.js  ├── Workers/
├── Assets/    ├── Widgets/   └── ThirdParty/
```

### 2. 设置 CESIUM_BASE_URL

Vite 中用 define 注入 CESIUM_BASE_URL 指向本地目录，或用 vite-plugin-cesium 自动拷贝。该变量决定 buildModuleUrl 的解析基准。

```
export default defineConfig({
  define: { CESIUM_BASE_URL: JSON.stringify('/cesium/') },
  optimizeDeps: { exclude: ['cesium'] }
})
```

### 3. 关闭四个在线依赖

baseLayerPicker、geocoder 设为 false，Ion.defaultAccessToken 置 undefined，影像改为内置 NaturalEarthII 或本地 TMS。在线图层预览与地名搜索在内网必然失败。

```
new Cesium.Viewer(el, { baseLayerPicker: false, geocoder: false })
```

### 4. 接入本地影像、地形与模型

影像用 gdal2tiles 切成 TMS/XYZ 目录，地形用 cesium-terrain-builder 生成 quantized-mesh，3D Tiles、glb、PLY 放静态服务。服务端配 CORS 与 .terrain/.glb/.pbf 的 MIME。

```
new Cesium.UrlTemplateImageryProvider({
  url: '/tiles/{z}/{x}/{reverseY}.jpg'
})
```

## 三、推荐配置

```js
const viewer = new Cesium.Viewer('cesiumContainer', {
  baseLayerPicker: false,
  geocoder: false,
  animation: false,
  timeline: false,
  terrainProvider: new Cesium.EllipsoidTerrainProvider(),
  baseLayer: Cesium.ImageryLayer.fromProviderAsync(
    Cesium.TileMapServiceImageryProvider.fromUrl(
      Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')
    )
  )
})
Cesium.Ion.defaultAccessToken = undefined
```

## 四、常见坑

- 只拷 Cesium.js 或缺 Workers 目录是最常见的白屏原因
- file:// 下加载 3D Tiles 会被当作跨源请求，必须走 HTTP
- 影像切片方案（Geographic / WebMercator）与 tilingScheme 不一致会导致瓦片错位

## 五、断网验收

断网打开三维场景，地球、影像、模型均正常，Network 无 api.cesium.com 与 virtualearth 请求。

## 六、资源包

- 下载：`vendor/cesium/cesium-1.147.0.tar.gz`（由 `node scripts/build-vendor.mjs --only=cesium` 生成）
- 来源：`cesium@1.147.0`，npm 镜像 https://registry.npmmirror.com

---

返回 [教程索引](./INDEX.md)　|　[内网门户](../index.html)　|　清单更新日期 2026-11-12
