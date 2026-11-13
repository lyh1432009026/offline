# 二维码 / 本地校验工具 — 内网离线使用教程

> 所属分类：工具服务　|　版本：1.5.4　|　许可：MIT　|　资源体积：展开 0.1 MB / 下载包 0.0 MB · 36 个文件

纯本地计算，作为「无需任何离线改造」的对照项；同时提示验证码与统计类服务的替换。

## 一、离线风险点

默认会请求的公网域名：无（纯本地包）

必须随包发布的文件：

- `build/qrcode.min.js`

## 二、接入步骤

安装 / 部署：

```bash
npm i qrcode@1.5.4
```

### 1. 直接用 npm 包

二维码生成是纯前端计算，没有 CDN 依赖，也不需要资源包。内网私仓安装后即可使用。

```
import QRCode from 'qrcode'
```

### 2. 内容编码与容量

中文内容按 UTF-8 编码，长度较大时提高纠错等级会降低容量，需实测扫码识别率。

```
QRCode.toDataURL(text, { errorCorrectionLevel: 'M' })
```

### 3. 顺带清理在线服务

同类需要一并移除或内网化的还有：行为验证码（极验/云验证码 → 本地图形或滑块）、Sentry / 百度统计、在线客服、Gravatar 头像、CDN 图标。它们不属于组件库，但会让离线验收失败。

```
// 上线前用 scripts/check-offline.mjs 扫描 dist
```

## 三、推荐配置

```js
import QRCode from 'qrcode'

await QRCode.toCanvas(document.querySelector('#qr'), 'http://intranet/asset/1001', {
  width: 180,
  margin: 1,
  errorCorrectionLevel: 'M'
})
```

## 四、常见坑

- 二维码里写公网地址，扫出来仍然打不开
- 内容过长时纠错等级与尺寸需同步调整

## 五、断网验收

断网生成二维码并扫码，内容正确且页面无外网请求。

## 六、资源包

- 下载：`vendor/qrcode/qrcode-1.5.4.tar.gz`（由 `node scripts/build-vendor.mjs --only=qrcode` 生成）
- 来源：`qrcode@1.5.4`，npm 镜像 https://registry.npmmirror.com

---

返回 [教程索引](./INDEX.md)　|　[内网门户](../index.html)　|　清单更新日期 2026-11-12
