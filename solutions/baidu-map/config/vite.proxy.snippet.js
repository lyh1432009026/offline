// 合并到 vite.config.js 的 server.proxy 中（开发期用）
// 生产环境用 Nginx 同前缀转发，见 tiles/README.md
export const mapTilesProxy = {
  '/map-tiles': {
    target: 'http://<瓦片服务地址>:<端口>',   // 改成实际内网瓦片服务
    changeOrigin: true,
    rewrite: (p) => p.replace(/^\/map-tiles/, '/map')
  }
}

// 用法：
// import { mapTilesProxy } from './config/vite.proxy.snippet.js'
// export default defineConfig({ server: { proxy: { ...mapTilesProxy } } })
