# 底图瓦片服务约定

本方案包**不含瓦片数据**。瓦片由内网独立静态服务提供，前端通过 `mapConfig.tiles_dir` 访问。

## 目录格式

```
{tiles_dir}/{z}/{x}/{y}.jpg
```

- `z`：缩放级别，`x` / `y`：瓦片行列号
- 后缀由 `mapConfig.imgext` 决定，默认为 `.jpg`；若瓦片是 `.png`，同步改成 `.png`
- 历史遗留的绝对地址写法已废弃，统一使用同域相对路径 `/map-tiles`

## Nginx 配置片段

推荐把瓦片服务挂到**应用同域**的 `/map-tiles` 前缀，避免跨域、硬编码 IP 与混合内容：

```nginx
# 应用所在 server 内
location ^~ /map-tiles/ {
    proxy_pass http://瓦片服务内网地址:端口/map/;   # 注意结尾斜杠会替换前缀
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    expires 30d;
    add_header Cache-Control "public, immutable";
    add_header Access-Control-Allow-Origin "*";
}

# 若瓦片直接落在本地磁盘，改成静态服务：
# location ^~ /map-tiles/ {
#     alias /data/map-tiles/;
#     types { image/jpeg jpg; image/png png; }
#     add_header Access-Control-Allow-Origin "*";
# }
```

## 自检

```bash
# 换成实际地址，确认返回图片而非 404 / HTML
curl -I "http://<瓦片服务地址>:<端口>/map/12/3370/1550.jpg"
curl -I http://127.0.0.1:8080/map-tiles/12/3370/1550.jpg
```

浏览器 DevTools → Network 过滤 `map-tiles`，确认瓦片请求状态码全为 200 且 `Content-Type` 为 `image/jpeg`。

## 常见问题

| 现象 | 排查点 |
| --- | --- |
| 地图空白、控制台大量 404 | `tiles_dir` 前缀、`imgext` 后缀、`{z}/{x}/{y}` 层级 |
| 瓦片错位 | 瓦片切片方案与百度 BD09 墨卡托瓦片规则是否一致 |
| 跨域报错 | 瓦片服务补 `Access-Control-Allow-Origin`，或改同域代理 |
| 部分级别没图 | 确认瓦片服务实际覆盖的 z 级别范围，用 `minZoom` / `maxZoom` 限制 |
| HTTPS 页面瓦片不显示 | 混合内容被拦截，瓦片服务也要走 HTTPS 或同域代理 |
