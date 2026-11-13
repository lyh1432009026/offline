/**
 * 坐标系转换工具：WGS84 → GCJ02 → BD09（纯前端算法，无网络依赖）
 *
 * 背景：离线百度地图底图为 BD09 坐标系，而业务数据（区域围栏 GeoJSON）
 * 为 WGS84 / CGCS2000（EPSG:4490，两者差异厘米级，可等同按 WGS84 处理），
 * 加载前需逐点转换为 BD09，否则显示整体偏移约 500m~1km。
 *
 * 注意：
 * - GCJ02 加密为业界公开的近似算法（非官方授权公式），偏差约 1~2 米，
 *   满足围栏/标注显示精度，不可用于测绘确权等高精度场景；
 * - 离线环境下百度官方 convertor 模块（在线 geoconv API）不可用，故必须本地换算。
 */

/** GCJ02/BD09 公式约定的扩展圆周率 */
const X_PI = (Math.PI * 3000) / 180
/** 圆周率 */
const PI = Math.PI
/** 克拉索夫斯基椭球长半轴 */
const SEMI_AXIS = 6378245.0
/** 椭球偏心率平方 */
const EE = 0.00669342162296594323

/**
 * 判断坐标是否在中国大陆范围外（境外无 GCJ02 加密偏移，直接返回原值）
 * @param {number} lng 经度
 * @param {number} lat 纬度
 * @returns {boolean} 境外返回 true
 */
function outOfChina(lng, lat) {
  return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271
}

/**
 * GCJ02 纬度偏移量计算（官方公开多项式近似）
 * @param {number} lng 经度
 * @param {number} lat 纬度
 * @returns {number} 纬度偏移量（度）
 */
function transformLat(lng, lat) {
  let ret =
    -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng))
  ret += ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0
  ret += ((20.0 * Math.sin(lat * PI) + 40.0 * Math.sin((lat / 3.0) * PI)) * 2.0) / 3.0
  ret += ((160.0 * Math.sin((lat / 12.0) * PI) + 320 * Math.sin((lat * PI) / 30.0)) * 2.0) / 3.0
  return ret
}

/**
 * GCJ02 经度偏移量计算（官方公开多项式近似）
 * @param {number} lng 经度
 * @param {number} lat 纬度
 * @returns {number} 经度偏移量（度）
 */
function transformLng(lng, lat) {
  let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng))
  ret += ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0
  ret += ((20.0 * Math.sin(lng * PI) + 40.0 * Math.sin((lng / 3.0) * PI)) * 2.0) / 3.0
  ret += ((150.0 * Math.sin((lng / 12.0) * PI) + 300.0 * Math.sin((lng / 30.0) * PI)) * 2.0) / 3.0
  return ret
}

/**
 * WGS84 → GCJ02（火星坐标系）
 * @param {number} lng WGS84 经度
 * @param {number} lat WGS84 纬度
 * @returns {[number, number]} [gcjLng, gcjLat]；非法或境外坐标原样返回
 */
export function wgs84ToGcj09(lng, lat) {
  // 卫语句：非法坐标或境外坐标不做偏移
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return [lng, lat]
  if (outOfChina(lng, lat)) return [lng, lat]

  let dLat = transformLat(lng - 105.0, lat - 35.0)
  let dLng = transformLng(lng - 105.0, lat - 35.0)
  const radLat = (lat / 180.0) * PI
  let magic = Math.sin(radLat)
  magic = 1 - EE * magic * magic
  const sqrtMagic = Math.sqrt(magic)
  dLat = (dLat * 180.0) / (((SEMI_AXIS * (1 - EE)) / (magic * sqrtMagic)) * PI)
  dLng = (dLng * 180.0) / ((SEMI_AXIS / sqrtMagic) * Math.cos(radLat) * PI)
  return [lng + dLng, lat + dLat]
}

/**
 * GCJ02 → BD09（百度坐标系）
 * @param {number} lng GCJ02 经度
 * @param {number} lat GCJ02 纬度
 * @returns {[number, number]} [bdLng, bdLat]
 */
export function gcj02ToBd09(lng, lat) {
  const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * X_PI)
  const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * X_PI)
  return [z * Math.cos(theta) + 0.0065, z * Math.sin(theta) + 0.006]
}

/**
 * WGS84 → BD09：业务统一入口
 * @param {number} lng WGS84 经度
 * @param {number} lat WGS84 纬度
 * @returns {[number, number]} [bdLng, bdLat]
 */
export function wgs84ToBd09(lng, lat) {
  const [gcjLng, gcjLat] = wgs84ToGcj09(lng, lat)
  return gcj02ToBd09(gcjLng, gcjLat)
}

/**
 * 转换多边形坐标环集合（GeoJSON Polygon / MultiPolygon 展开后的 rings）
 * 纯函数：不修改入参，返回新数组
 * @param {Array<Array<[number, number]>>} rings 坐标环集合，每环为 [lng, lat] 点数组
 * @returns {Array<Array<[number, number]>>} BD09 坐标环集合；入参非法返回空数组
 */
export function transformRings(rings) {
  // 卫语句：非法环集合直接返回空数组
  if (!Array.isArray(rings)) return []
  return rings.map((ring) =>
    (Array.isArray(ring) ? ring : []).map(([lng, lat]) => wgs84ToBd09(lng, lat))
  )
}
