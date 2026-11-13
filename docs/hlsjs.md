# hls.js / 视频播放 — 内网离线使用教程

> 所属分类：音视频　|　版本：1.7.4　|　许可：Apache-2.0　|　资源体积：展开 29.9 MB / 下载包 7.3 MB · 24 个文件

HLS 播放，npm 包本地打包；m3u8 与分片必须来自内网流媒体服务。

## 一、离线风险点

默认会请求的公网域名：`cdn.jsdelivr.net`、`vjs.zencdn.net`

必须随包发布的文件：

- `dist/hls.min.js`
- `dist/hls.mjs`

## 二、接入步骤

安装 / 部署：

```bash
npm i hls.js@1.7.4
```

### 1. 用 npm 包替换 CDN 播放器

删除 index.html 里 video.js / hls.js 的 CDN script 与 CSS，改为 npm 安装并 import。播放器皮肤的字体与 sprite 也要本地化。

```
import Hls from 'hls.js'
import 'video.js/dist/video-js.css'
```

### 2. 指向内网流媒体

m3u8 与 ts/fMP4 分片由内网 Nginx-RTMP、SRS 或点播服务提供，路径用相对地址。分片服务需返回正确 MIME 与 CORS 头。

```
hls.loadSource('/vod/demo/index.m3u8')
```

### 3. 准备不支持 MSE 的兜底

部分内网终端浏览器较旧，检测 Hls.isSupported() 失败时回退到原生 HLS（Safari）或直接播放 mp4。flv.js 场景同理。

```
video.src = '/vod/demo.mp4' // 兜底
```

### 4. 处理 Worker 与销毁

enableWorker 时确认构建产物包含 worker 文件；组件卸载调用 hls.destroy()，避免持续拉流。

```
onBeforeUnmount(() => hls?.destroy())
```

## 三、推荐配置

```js
import Hls from 'hls.js'

const video = document.querySelector('#video')
if (Hls.isSupported()) {
  const hls = new Hls({ enableWorker: true })
  hls.loadSource('/live/stream.m3u8')
  hls.attachMedia(video)
} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
  video.src = '/live/stream.m3u8'
}
```

## 四、常见坑

- 分片服务缺 CORS 头会导致播放黑屏
- 旧版 IE/Edge 无 MSE，需要 mp4 兜底
- 播放器 CSS 内引用的字体与图标常被漏拷

## 五、断网验收

断网播放内网 m3u8 与 mp4，画面正常，Network 全部指向内网地址。

## 六、资源包

- 下载：`vendor/hlsjs/hlsjs-1.7.4.tar.gz`（由 `node scripts/build-vendor.mjs --only=hlsjs` 生成）
- 来源：`hls.js@1.7.4`，npm 镜像 https://registry.npmmirror.com

---

返回 [教程索引](./INDEX.md)　|　[内网门户](../index.html)　|　清单更新日期 2026-11-12
