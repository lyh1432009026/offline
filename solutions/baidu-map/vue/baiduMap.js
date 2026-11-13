/**
 * 离线百度地图加载器（通用版本）
 *
 * 实现原理：
 * 1. 离线版 API（public/map/js/baidu_map_offline_3.0.js）为老式全局脚本，
 *    内部读取全局 window.mapConfig 决定瓦片地址与模块加载路径；
 * 2. 该脚本必须通过 <script> 标签执行（不能被 Vite 预构建转译），
 *    因此资源统一放在 public/map/ 下，由 Vite 原样静态提供；
 * 3. AreaRestriction_min.js（地图视野限制库）依赖 BMap 全局变量，需在 API 之后加载。
 *
 * 三种瓦片地址配置方式，任选其一：
 *   a) 同域相对路径 + 反向代理（推荐，见 config/vite.proxy.snippet.js）
 *   b) .env 中 VITE_APP_MAP_TILES_URL 指向内网瓦片服务
 *   c) 直接改下方 DEFAULT_TILES_URL
 */

/** 瓦片服务地址：默认同域相对路径，推荐用 Nginx / Vite 代理转发到内网瓦片服务 */
const DEFAULT_TILES_URL = '/map-tiles'

/**
 * 初始化全局地图配置（离线 API 通过 window.mapConfig 读取）
 * - home: 功能模块与控件图片的本地根路径（对应 public/map/），必须与部署路径一致
 * - tiles_dir: 底图瓦片服务地址，格式约定 {z}/{x}/{y}.jpg
 * - tiles_hybrid / tiles_self: 卫星与自定义图层，离线环境置空
 *
 * 注意：离线 API 从 window.BMAP_AUTHENTIC_KEY 读取密钥，纯离线模式无需 AK；
 * 若私有化 SDK 要求鉴权，应由后端注入，不要把明文 AK 写进前端代码。
 */
function initMapConfig() {
  // 避免重复初始化覆盖已有配置
  if (window.mapConfig) return

  window.mapConfig = {
    // 瓦片文件后缀：服务器瓦片为 jpg，故前端直接按 jpg 请求
    imgext: '.jpg',
    tiles_dir: import.meta.env.VITE_APP_MAP_TILES_URL || DEFAULT_TILES_URL,
    // 卫星/自定义图层未做离线化，置空回退到本地目录（内网下不可用）
    tiles_hybrid: '',
    tiles_self: '',
    home: '/map/'
  }
}

/**
 * 动态注入 script 标签加载脚本
 * @param {string} src 脚本地址
 * @returns {Promise<void>}
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = false // 保证多脚本按注入顺序执行
    script.onload = () => resolve()
    script.onerror = () => {
      script.remove()
      reject(new Error(`[BaiduMap] 离线地图脚本加载失败: ${src}`))
    }
    document.head.appendChild(script)
  })
}

/** 加载任务缓存：保证并发调用只加载一次 */
let loadPromise = null

/**
 * 加载离线百度地图（幂等，可重复调用）
 * @returns {Promise<typeof window.BMap>} 全局 BMap 命名空间
 */
export function loadBaiduMap() {
  // 已加载完成直接返回（含 AreaRestriction 扩展库）
  if (window.BMap && window.BMapLib) {
    return Promise.resolve(window.BMap)
  }
  if (loadPromise) return loadPromise

  initMapConfig()
  loadPromise = loadScript('/map/js/baidu_map_offline_3.0.js')
    .then(() => loadScript('/map/js/AreaRestriction_min.js'))
    .then(() => {
      if (!window.BMap) {
        throw new Error('[BaiduMap] 离线地图脚本执行异常：window.BMap 不存在')
      }
      console.info('[BaiduMap] 离线百度地图加载完成')
      return window.BMap
    })
    .catch((err) => {
      // 失败后重置缓存，允许下次重试
      loadPromise = null
      console.error(err.message)
      throw err
    })

  return loadPromise
}

export default loadBaiduMap
