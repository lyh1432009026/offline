<template>
  <div :id="mapId" class="bmap-container" />
</template>

<script setup name="BaiduMap">
/**
 * 离线百度地图通用组件（Vue 3 版）
 *
 * 用法示例：
 * <BaiduMap
 *   :center="[117.0884, 36.2003]"
 *   :zoom="11"
 *   :markers="[{ lng: 117.12, lat: 36.19, name: '示例点位' }]"
 *   :polygons="[{ name: '区域 A', points: [[[lng,lat], ...]] }]"
 *   @ready="onMapReady"
 *   @marker-click="onMarkerClick"
 *   @polygon-click="onPolygonClick"
 * />
 */
import { loadBaiduMap } from '@/utils/baiduMap'

const props = defineProps({
  /** 地图中心点 [经度, 纬度]（BD09 坐标系） */
  center: { type: Array, default: () => [117.0884, 36.2003] },
  /** 初始缩放级别 3-19 */
  zoom: { type: Number, default: 11 },
  /** 最小缩放级别（防止缩小到无瓦片区域） */
  minZoom: { type: Number, default: 1 },
  /** 最大缩放级别 */
  maxZoom: { type: Number, default: 19 },
  /** 是否开启滚轮缩放 */
  scrollWheel: { type: Boolean, default: true },
  /**
   * 标注点数组
   * @type {Array<{lng: number, lat: number, name?: string, color?: string, icon?: string, iconSize?: [number, number]}>}
   * - icon: 自定义标注图标 URL（不传则使用默认标注）
   * - iconSize: 图标尺寸 [宽, 高]，默认 [28, 34]
   */
  markers: { type: Array, default: () => [] },
  /**
   * 面类覆盖物（多边形围栏）数组：每个元素渲染为一个填充多边形并标注区名
   * @type {Array<{name?: string, color?: string, strokeColor?: string, labelStyle?: 'mini', points?: number[][][]>}
   * - points: 多边形坐标环数组；每个环是 [lng, lat] 点数组。
   *   Polygon 传单个环 `[[lng,lat],...]`；MultiPolygon 传多个环 `[[[lng,lat],...], ...]`。
   * - color: 填充色（含透明度），默认 rgba(15,155,108,0.28)
   * - strokeColor: 描边色，默认 #0f9b6c
   * - labelStyle: 'mini' 时标签只保留缩小文字（无边框/背景），用于小区块/编号；缺省为带边框的区名样式
   */
  polygons: { type: Array, default: () => [] }
})

const emit = defineEmits(['ready', 'map-click', 'marker-click', 'polygon-click'])

/** 容器唯一 id（同一页面可放多个地图实例） */
const mapId = `bmap_${Math.random().toString(36).slice(2, 9)}`

// 区域填充色板：统一绿色面，用轻微色差区分不同区块
const POLYGON_COLORS = [
  'rgba(126, 209, 168, 0.6)',
  'rgba(139, 214, 178, 0.6)',
  'rgba(132, 211, 172, 0.6)',
  'rgba(119, 206, 162, 0.6)',
  'rgba(144, 217, 183, 0.6)'
]

let BMap = null
let map = null

onMounted(async () => {
  try {
    BMap = await loadBaiduMap()
    initMap()
  } catch (err) {
    console.error('[BaiduMap] 地图初始化失败:', err)
  }
})

onBeforeUnmount(() => {
  // 释放地图实例，避免内存泄漏（SPA 路由切换场景）
  if (map) {
    map.clearOverlays()
    map = null
  }
})

/** 初始化地图实例 */
function initMap() {
  if (!document.getElementById(mapId)) return

  map = new BMap.Map(mapId, { minZoom: props.minZoom, maxZoom: props.maxZoom })
  map.centerAndZoom(new BMap.Point(props.center[0], props.center[1]), props.zoom)
  map.enableScrollWheelZoom(props.scrollWheel)
  map.addEventListener('click', (e) => emit('map-click', e.point))

  redraw()
  emit('ready', map)
}

/**
 * 计算多边形的几何中心（用于放置区名标注）。
 * 取所有坐标点的算术平均，作为视觉居中的近似中心。
 * @param {number[][][]} rings 多边形坐标环数组
 * @returns {[number, number] | null} [经度, 纬度]
 */
function computePolygonCenter(rings) {
  let sumLng = 0
  let sumLat = 0
  let count = 0
  rings.forEach((ring) => {
    ring.forEach((point) => {
      sumLng += point[0]
      sumLat += point[1]
      count += 1
    })
  })
  if (!count) return null
  return [sumLng / count, sumLat / count]
}

/**
 * 计算单个坐标环的面积（鞋带公式，取绝对值）
 * @param {number[][]} ring 坐标环（[lng, lat] 点数组）
 * @returns {number} 环面积
 */
function ringArea(ring) {
  let area = 0
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i]
    const [x2, y2] = ring[(i + 1) % ring.length]
    area += x1 * y2 - x2 * y1
  }
  return Math.abs(area) / 2
}

/**
 * 计算单个坐标环的面积质心（鞋带公式质心）。
 * 相比逐点算术平均，质心不受边界顶点疏密影响，更接近区域的视觉中间。
 * @param {number[][]} ring 坐标环（[lng, lat] 点数组）
 * @returns {[number, number] | null} [经度, 纬度]；退化环（共线/面积近零）返回 null
 */
function ringCentroid(ring) {
  let crossSum = 0
  let cx = 0
  let cy = 0
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i]
    const [x2, y2] = ring[(i + 1) % ring.length]
    const cross = x1 * y2 - x2 * y1
    crossSum += cross
    cx += (x1 + x2) * cross
    cy += (y1 + y2) * cross
  }
  // 卫语句：面积近零的退化环无法计算质心
  if (Math.abs(crossSum) < 1e-12) return null
  return [cx / (3 * crossSum), cy / (3 * crossSum)]
}

/**
 * 射线法判断点是否在坐标环内部（用于校验标注点是否落在区块内）
 * @param {number} lng 经度
 * @param {number} lat 纬度
 * @param {number[][]} ring 坐标环
 * @returns {boolean} 是否在环内
 */
function pointInRing(lng, lat, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    const hit = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    if (hit) inside = !inside
  }
  return inside
}

/**
 * 计算多边形标注位置：取面积最大的主体环的质心，保证文字落在区域中间；
 * 质心越界（凹多边形）时回退为全部点的算术平均中心，再越界则取两者中可用的一个
 * @param {number[][][]} rings 多边形坐标环数组
 * @returns {[number, number] | null} [经度, 纬度]
 */
function computeLabelCenter(rings) {
  // 卫语句：过滤非法环
  const validRings = (rings || []).filter((r) => Array.isArray(r) && r.length)
  if (!validRings.length) return null
  // 主体环 = 面积最大的环（MultiPolygon 的附属小块不参与定位）
  const mainRing = validRings.reduce((best, r) => (ringArea(r) > ringArea(best) ? r : best), validRings[0])
  const centroid = ringCentroid(mainRing)
  if (centroid && pointInRing(centroid[0], centroid[1], mainRing)) return centroid
  // 回退：全部点算术平均中心
  const avg = computePolygonCenter(validRings)
  if (avg && pointInRing(avg[0], avg[1], mainRing)) return avg
  return centroid || avg
}

/**
 * 渲染多边形围栏：每个多边形绘制为填充面，并在区域中间叠加区名标注
 */
function renderPolygons() {
  if (!map || !Array.isArray(props.polygons)) return

  props.polygons.forEach((poly, index) => {
    // 卫语句：无有效坐标环直接跳过
    if (!poly || !Array.isArray(poly.points) || !poly.points.length) return

    // 统一为环数组（Polygon 单环与 MultiPolygon 多环兼容）
    const rings = poly.points.every((r) => Array.isArray(r) && Array.isArray(r[0]))
      ? poly.points
      : [poly.points]

    const color = poly.color || POLYGON_COLORS[index % POLYGON_COLORS.length]
    // 白色边界线 + 淡绿色渲染面
    const strokeColor = poly.strokeColor || '#ffffff'

    // 离线 BMap.Polygon 仅接受“单环点的数组”，因此每个环各自创建一个 Polygon
    rings.forEach((ring) => {
      // 卫语句：跳过空环/非法环
      if (!Array.isArray(ring) || !ring.length) return
      const pts = ring.map((p) => new BMap.Point(p[0], p[1]))
      const polygon = new BMap.Polygon(pts, {
        strokeColor,
        strokeWeight: 2,
        strokeOpacity: 0.9,
        fillColor: color,
        fillOpacity: 0.9
      })
      map.addOverlay(polygon)
      // 区块点击回调：向外抛出 polygon-click 并携带该多边形配置，供选择类地图交互使用
      polygon.addEventListener('click', (e) => emit('polygon-click', poly, e))
    })

    // 区块中央标注区名（每块仅标注一次）：位置取主体区域的中间
    if (poly.name) {
      const center = computeLabelCenter(rings)
      if (center) {
        const label = new BMap.Label(poly.name, {
          position: new BMap.Point(center[0], center[1]),
          offset: new BMap.Size(0, 0)
        })
        // 精简样式（labelStyle==='mini'，用于小区块/编号）：缩小字号、去边框与背景，仅保留文字；
        // 以 transform 将文字相对锚点水平垂直居中，确保编号显示在区域中间
        const miniStyle = {
          color: '#fff',
          fontSize: '12px',
          fontWeight: '600',
          fontFamily: '微软雅黑',
          border: 'none',
          background: 'transparent',
          padding: '0',
          lineHeight: '1',
          whiteSpace: 'nowrap',
          // 深色描边文字，保证白色标注在浅色/彩色底图上依然清晰可读
          textShadow: '-1px 0 0 #000, 1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000',
          transform: 'translate(-50%, -50%)'
        }
        // 默认样式（区名）：带绿色边框与白色背景，便于识别区块
        const defaultStyle = {
          color: '#0c6b45',
          fontSize: '14px',
          fontWeight: '700',
          fontFamily: '微软雅黑',
          border: '1px solid rgba(15, 155, 108, 0.6)',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '4px 10px',
          borderRadius: '4px',
          lineHeight: '1.2'
        }
        label.setStyle(poly.labelStyle === 'mini' ? miniStyle : defaultStyle)
        // 标注仅为区块名称展示，不绑定任何点击事件；
        // 必须禁用其鼠标事件，否则 label 的 DOM 盒子会拦截点击，
        // 导致点击区块中央（标注文字处）无法命中多边形（polygon-click 不触发）
        label.setStyle({ pointerEvents: 'none' })
        map.addOverlay(label)
      }
    }
  })
}

/** 全量重绘（清空后依次叠加多边形与点标记，保证两类覆盖物共存） */
function redraw() {
  if (!map) return
  map.clearOverlays()
  renderPolygons()

  const markers = props.markers || []
  markers.forEach((item) => {
    if (!item || !item.lng || !item.lat) return
    const point = new BMap.Point(item.lng, item.lat)

    // 存在自定义图标时使用 BMap.Icon，否则回退到默认标注
    let marker
    if (item.icon) {
      const [w, h] = item.iconSize || [28, 34]
      const icon = new BMap.Icon(item.icon, new BMap.Size(w, h), {
        // 锚点设为图标底部中心，保证尖端对准坐标点
        anchor: new BMap.Size(w / 2, h)
      })
      marker = new BMap.Marker(point, { icon })
    } else {
      marker = new BMap.Marker(point)
    }
    map.addOverlay(marker)

    if (item.name) {
      const label = new BMap.Label(item.name, {
        position: point,
        offset: new BMap.Size(-10, 20)
      })
      label.setStyle({
        color: item.color || '#4E5969',
        fontSize: '12px',
        fontFamily: '微软雅黑',
        border: 'none',
        background: 'transparent',
        // 纯展示标注禁用鼠标事件，避免拦截下方多边形/标注点的点击
        pointerEvents: 'none'
      })
      map.addOverlay(label)
    }

    marker.addEventListener('click', () => emit('marker-click', item))
  })
}

// 标注或多边形数据变化时统一重绘
watch(() => [props.polygons, props.markers], redraw, { deep: true })

/** 对外暴露能力 */
defineExpose({
  /** 获取地图实例（用于调试调用原生 BMap API） */
  getMap: () => map,
  /** 飞行到指定中心点 */
  setCenter: (lng, lat) => map && map.panTo(new BMap.Point(lng, lat)),
  /** 设置缩放级别 */
  setZoom: (z) => map && map.setZoom(z),
  /** 清空所有覆盖物 */
  clearOverlays: () => map && map.clearOverlays(),
  /** 适配地图视野到多边形围栏（自动计算边界并带上边距可见区名） */
  fitToPolygons: () => {
    if (!map || !Array.isArray(props.polygons) || !props.polygons.length) return
    let minLng = Infinity
    let minLat = Infinity
    let maxLng = -Infinity
    let maxLat = -Infinity
    props.polygons.forEach((poly) => {
      ;(poly.points || []).forEach((ring) => {
        // 兼容单环与多环
        const points = Array.isArray(ring) && ring.length && Array.isArray(ring[0]) ? ring : [ring]
        points.forEach((p) => {
          minLng = Math.min(minLng, p[0])
          minLat = Math.min(minLat, p[1])
          maxLng = Math.max(maxLng, p[0])
          maxLat = Math.max(maxLat, p[1])
        })
      })
    })
    if (minLng === Infinity) return
    map.setViewport(
      [new BMap.Point(minLng, minLat), new BMap.Point(maxLng, maxLat)],
      { margins: [60, 60, 60, 60] }
    )
  },
  /** 适配地图视野到指定经纬度边界 [sw: [lng,lat], ne: [lng,lat]] */
  fitBounds: (sw, ne) => map && map.setViewport([new BMap.Point(sw[0], sw[1]), new BMap.Point(ne[0], ne[1])], { margins: [60, 60, 60, 60] }),
  /** 限制地图视野范围（BMapLib.AreaRestriction 扩展库） */
  setBounds: (sw, ne) => window.BMapLib.AreaRestriction.setBounds(map, new BMap.Bounds(new BMap.Point(...sw), new BMap.Point(...ne)))
})
</script>

<style lang="scss" scoped>
.bmap-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
/* 早期实现曾隐藏百度版权控件（.BMap_cpyCtrl / .anchorBL）。
   本方案默认保留显示，请按与地图服务方的授权约定决定是否调整。 */
</style>