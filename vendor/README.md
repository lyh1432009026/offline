# vendor/ 目录说明

本目录下的资源包、展开目录与清单**均由 `scripts/build-vendor.mjs` 生成**，已在 `.gitignore` 中排除，不进版本库。

## 为什么不入库

- 20 个资源包 + 展开目录合计约 362 MB，含大量可重建的二进制与 source map；
- Git 适合存源码、配置与文档，不适合存构建产物；
- 版本号已写在 `catalog.json`，任何人都可一键重建完全一致的包。

## 重新生成

在联网机器执行：

```bash
node scripts/build-vendor.mjs                  # 构建全部条目
node scripts/build-vendor.mjs --only=vditor     # 增量更新单个
node scripts/build-vendor.mjs --all            # 强制全量重建
```

生成后 `vendor/manifest.js` 会被门户读取，卡片上的「下载资源包」按钮自动可用。

## 内网交付注意

**不要只 clone 仓库**。请把整个「离线方案」目录（含 `vendor/`、`docs/`、`data/`）原样拷贝到内网；若只拿到仓库，需依次执行：

```bash
node scripts/sync.mjs
node scripts/build-vendor.mjs
```
