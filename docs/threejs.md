# Three.js — 内网离线使用教程

> 所属分类：三维地图　|　版本：0.187.0　|　许可：MIT　|　资源体积：展开 15.5 MB / 下载包 3.6 MB · 517 个文件

三维渲染，加载器与 DRACO/KTX2 解码器、贴图、HDR 资源需要本地化。

## 一、离线风险点

默认会请求的公网域名：`cdn.jsdelivr.net`、`unpkg.com`、`www.gstatic.com`

必须随包发布的文件：

- `build/three.module.js`
- `examples/jsm/loaders/*`
- `examples/jsm/libs/draco/*`
- `examples/jsm/libs/basis/*`

## 二、接入步骤

安装 / 部署：

```bash
npm i three@0.187.0
```

### 1. 从 npm 引入加载器

所有 examples/jsm 下的加载器都从本地包引入，不要用 CDN 的 UMD 版本。PLY 点云是纯静态文件，直接放 public/models/ 即可离线加载。

```
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js'
```

### 2. 拷贝解码器文件

DRACOLoader、KTX2Loader、GLTFLoader 的某些扩展会运行时加载 wasm/js 解码器。把 examples/jsm/libs/draco/ 与 basis/ 拷到 public，并用 setDecoderPath / setTranscoderPath 指向本地。

```
draco.setDecoderPath('/vendor/three/draco/')
ktx2.setTranscoderPath('/vendor/three/basis/')
```

### 3. 本地化贴图与环境贴图

glTF/glb 内引用的 .bin、贴图 URI、HDR 环境光文件都要同源发布；检查 glb 是否被打包成外链 URI 形式。

```
new RGBELoader().load('/env/studio.hdr', tex => { scene.environment = tex })
```

### 4. 配置 wasm MIME 与 CORS

DRACO/KTX2 的 wasm 需返回 application/wasm，跨源加载需 CORS 头；静态模型服务不要用 file:// 打开。

```
types { application/wasm wasm; }
```

## 三、推荐配置

```js
import * as THREE from 'three'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

const draco = new DRACOLoader()
draco.setDecoderPath('/vendor/three/draco/')

const loader = new PLYLoader()
loader.load('/models/pointcloud.ply', geo => {
  const points = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.02 }))
  scene.add(points)
})
```

## 四、常见坑

- 解码器路径少一层目录会报 404 且错误提示不明确
- glTF 外部贴图未随模型一起拷贝会全白
- HTTPS 页面加载 HTTP 资源会被混合内容策略拦截

## 五、断网验收

断网加载 PLY 点云与一个 draco 压缩的 glb，模型与贴图完整，Network 全部指向本站。

## 六、资源包

- 下载：`vendor/threejs/threejs-0.187.0.tar.gz`（由 `node scripts/build-vendor.mjs --only=threejs` 生成）
- 来源：`three@0.187.0`，npm 镜像 https://registry.npmmirror.com

---

返回 [教程索引](./INDEX.md)　|　[内网门户](../index.html)　|　清单更新日期 2026-11-12
