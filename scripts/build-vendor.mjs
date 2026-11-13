#!/usr/bin/env node
/**
 * 在【联网机器】上运行，按 catalog.json 抓取 npm 包、按需解包、生成可下载资源包与清单。
 * 含 localDir 字段的条目直接从本地方案目录打包（无需联网），适合复用已有工程方案。
 * 纯 Node 实现（fetch + zlib 自解析/生成 tar），不依赖 npm CLI、系统 tar 或任何第三方包。
 *
 *   node scripts/build-vendor.mjs                 抓取 catalog 中 prefetch: true 的组件
 *   node scripts/build-vendor.mjs --all          抓取全部有 npm 包的组件（含 Cesium/TinyMCE 等大包）
 *   node scripts/build-vendor.mjs --only=vditor,pdfjs   只抓指定组件
 *   node scripts/build-vendor.mjs --dry-run      只列出计划，不联网
 *   node scripts/build-vendor.mjs --registry=https://registry.npmmirror.com
 *
 * 产物：
 *   vendor/<id>/<version>/...             展开后的资源（门户可直接引用）
 *   vendor/<id>/<id>-<version>.tar.gz    单组件下载包，解压得到 <id>/ 目录
 *   vendor/<id>/meta.json                单项元信息
 *   vendor/manifest.json / manifest.js   总清单（门户用 script 标签读取）
 */
import { readFileSync, writeFileSync, mkdirSync, statSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join, resolve, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync, gzipSync } from 'node:zlib'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const VENDOR = join(ROOT, 'vendor')
const catalog = JSON.parse(readFileSync(join(ROOT, 'catalog.json'), 'utf8'))

const argv = process.argv.slice(2)
const arg = (k, d) => {
  const hit = argv.find((a) => a.startsWith(`--${k}=`))
  return hit ? hit.slice(k.length + 3) : d
}
const ALL = argv.includes('--all')
const DRY = argv.includes('--dry-run')
const ONLY = arg('only', '').split(',').map((s) => s.trim()).filter(Boolean)
const REGISTRY = (arg('registry', catalog.meta.registry) || catalog.meta.registry).replace(/\/$/, '')

const targets = catalog.items.filter((it) => {
  const hasSource = (it.package && it.extract?.length) || it.localDir
  if (!hasSource) return false
  if (ONLY.length) return ONLY.includes(it.id)
  return ALL || it.prefetch
})

if (!targets.length) {
  console.log('[build] 没有匹配的组件，检查 --only 参数或 catalog.json 的 package / extract 字段')
  process.exit(0)
}

console.log(`[build] 目标 ${targets.length} 个组件，源 ${REGISTRY}${DRY ? '（dry-run，不联网）' : ''}`)
targets.forEach((t) => console.log(`  - ${t.id.padEnd(18)} ${t.package ? `${t.package}@${t.version}` : `local:${t.localDir} (v${t.version})`}`))
if (DRY) process.exit(0)

mkdirSync(VENDOR, { recursive: true })

/* ---------- 网络 ---------- */
async function fetchWithRetry(url, asJson) {
  let last
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(120000) })
      if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`)
      return asJson ? await res.json() : Buffer.from(await res.arrayBuffer())
    } catch (e) {
      last = e
      if (i < 2) await new Promise((r) => setTimeout(r, 700 * (i + 1)))
    }
  }
  throw last
}

/* ---------- tar 解包（ustar / PAX） ---------- */
function untar(buf) {
  const out = new Map()
  let off = 0
  let paxPath = null
  while (off + 512 <= buf.length) {
    const h = buf.subarray(off, off + 512)
    if (h.every((b) => b === 0)) break
    const name = h.subarray(0, 100).toString('utf8').split('\0')[0]
    const sizeStr = h.subarray(124, 136).toString('ascii').replace(/\0.*$/, '').trim()
    const size = parseInt(sizeStr || '0', 8) || 0
    const type = String.fromCharCode(h[156] || 48)
    const prefix = h.subarray(345, 500).toString('utf8').split('\0')[0]
    const full = (prefix ? prefix + '/' : '') + name
    const data = buf.subarray(off + 512, off + 512 + size)
    off += 512 + Math.ceil(size / 512) * 512
    if (type === 'x' || type === 'g') {
      const m = /path=([^\n]+)/.exec(data.toString('utf8'))
      if (m) paxPath = m[1]
      continue
    }
    if (type === '0' || type === '7' || type === '\0') {
      out.set(paxPath || full, Buffer.from(data))
      paxPath = null
    }
  }
  return out
}

/* ---------- 生成 tar.gz ---------- */
function makeTarGz(files) {
  const chunks = []
  for (const f of files) {
    const h = Buffer.alloc(512)
    let base = f.name, prefix = ''
    if (base.length > 100) {
      for (let i = Math.max(1, base.length - 100); i < base.length; i++) {
        if (base[i - 1] === '/' && base.length - i <= 100 && i - 1 <= 155) {
          prefix = base.slice(0, i - 1)
          base = base.slice(i)
          break
        }
      }
    }
    h.write(base.slice(0, 100), 0, 100, 'utf8')
    h.write('0000644\0', 100, 8, 'ascii')
    h.write('0000000\0', 108, 8, 'ascii')
    h.write('0000000\0', 116, 8, 'ascii')
    h.write(f.data.length.toString(8).padStart(11, '0') + '\0', 124, 12, 'ascii')
    h.write('00000000000\0', 136, 12, 'ascii')
    h.write('        ', 148, 8, 'ascii')
    h.write('0', 156, 1, 'ascii')
    h.write('ustar\0', 257, 6, 'ascii')
    h.write('00', 263, 2, 'ascii')
    h.write(prefix.slice(0, 155), 345, 155, 'utf8')
    let sum = 0
    for (const b of h) sum += b
    h.write(sum.toString(8).padStart(6, '0') + '\0 ', 148, 8, 'ascii')
    chunks.push(h, f.data)
    const pad = (512 - (f.data.length % 512)) % 512
    if (pad) chunks.push(Buffer.alloc(pad))
  }
  chunks.push(Buffer.alloc(1024))
  return gzipSync(Buffer.concat(chunks), { level: 9 })
}

/* ---------- 工具 ---------- */
function patternsToRegExp(list) {
  return list.map((p) => {
    let s = p.replace(/^package\//, '')
    if (s.endsWith('/**')) s = s.slice(0, -3) + '/'
    const esc = s.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*')
    return new RegExp('^' + esc)
  })
}

function walk(dir, base = dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, base, out)
    else out.push(relative(base, full).split(sep).join('/'))
  }
  return out
}

function dirSize(dir) {
  let n = 0
  for (const f of walk(dir)) n += statSync(join(dir, f)).size
  return n
}

/* ---------- 主流程 ---------- */
const results = []
for (const item of targets) {
  const label = `${item.id}@${item.version}`
  try {
    // 本地方案包：直接把目录打成可下载 tar.gz，不访问网络
    if (item.localDir) {
      process.stdout.write(`[build] ${label} 本地打包中 ... `)
      const srcDir = resolve(ROOT, item.localDir)
      const rels = walk(srcDir)
      if (!rels.length) throw new Error(`本地目录为空：${item.localDir}`)
      const localFiles = rels.map((rel) => ({ rel, data: readFileSync(join(srcDir, rel)) }))
      const filesDir = join(VENDOR, item.id, item.version)
      mkdirSync(filesDir, { recursive: true })
      for (const f of localFiles) {
        const dest = join(filesDir, f.rel)
        mkdirSync(dirname(dest), { recursive: true })
        writeFileSync(dest, f.data)
      }
      const archiveName = `${item.id}-${item.version}.tar.gz`
      const arcBuf = makeTarGz(localFiles.map((f) => ({ name: `${item.id}/${f.rel}`, data: f.data })))
      writeFileSync(join(VENDOR, item.id, archiveName), arcBuf)
      const meta = {
        id: item.id, name: item.name, package: item.package || null, version: item.version,
        source: `local:${item.localDir}`, generatedAt: new Date().toISOString(),
        fileCount: localFiles.length, bytes: dirSize(filesDir),
        archive: `vendor/${item.id}/${archiveName}`, archiveBytes: arcBuf.length,
        sha256: createHash('sha256').update(arcBuf).digest('hex'),
        files: `vendor/${item.id}/${item.version}/`, cdnHosts: item.cdnHosts
      }
      writeFileSync(join(VENDOR, item.id, 'meta.json'), JSON.stringify(meta, null, 2) + '\n', 'utf8')
      results.push(meta)
      console.log(`完成（${localFiles.length} 个文件，${(arcBuf.length / 1024 / 1024).toFixed(2)} MB）`)
      continue
    }

    process.stdout.write(`[build] ${label} 下载中 ... `)
    const escaped = encodeURIComponent(item.package).replace(/^%40/, '@')
    const metaInfo = await fetchWithRetry(`${REGISTRY}/${escaped}/${item.version}`, true)
    const tarball = metaInfo && metaInfo.dist && metaInfo.dist.tarball
    if (!tarball) throw new Error('registry 未返回 dist.tarball')
    const tgz = await fetchWithRetry(tarball, false)
    const entries = [...untar(gunzipSync(tgz)).entries()]
    if (!entries.length) throw new Error('tgz 解析结果为空')

    const regs = patternsToRegExp(item.extract)
    const picked = []
    for (const [key, data] of entries) {
      if (!key.startsWith('package/')) continue
      const rel = key.slice('package/'.length)
      if (rel && regs.some((re) => re.test(rel))) picked.push({ rel, data })
    }
    if (!picked.length) throw new Error(`extract 规则未匹配到任何文件：${item.extract.join(', ')}`)

    // 按版本号分目录，直接覆盖写，不做递归删除（避免误删与系统删除保护）
    const filesDir = join(VENDOR, item.id, item.version)
    mkdirSync(filesDir, { recursive: true })
    for (const { rel, data } of picked) {
      const dest = join(filesDir, rel)
      mkdirSync(dirname(dest), { recursive: true })
      writeFileSync(dest, data)
    }

    const archiveName = `${item.id}-${item.version}.tar.gz`
    const archivePath = join(VENDOR, item.id, archiveName)
    const arcBuf = makeTarGz(picked.map(({ rel, data }) => ({ name: `${item.id}/${rel}`, data })))
    writeFileSync(archivePath, arcBuf)

    const meta = {
      id: item.id, name: item.name, package: item.package, version: item.version,
      generatedAt: new Date().toISOString(), fileCount: picked.length,
      bytes: dirSize(filesDir), archive: `vendor/${item.id}/${archiveName}`,
      archiveBytes: arcBuf.length,
      sha256: createHash('sha256').update(arcBuf).digest('hex'),
      files: `vendor/${item.id}/${item.version}/`, cdnHosts: item.cdnHosts
    }
    writeFileSync(join(VENDOR, item.id, 'meta.json'), JSON.stringify(meta, null, 2) + '\n', 'utf8')
    results.push(meta)
    console.log(`完成（${picked.length} 个文件，${(arcBuf.length / 1024 / 1024).toFixed(2)} MB）`)
  } catch (err) {
    console.log(`失败：${String(err && err.message || err).slice(0, 300)}`)
  }
}

// 增量构建（--only）时合并已有清单，保留未重新构建的组件
let previous = []
try {
  previous = JSON.parse(readFileSync(join(VENDOR, 'manifest.json'), 'utf8')).items || []
} catch (e) { /* 首次构建尚无清单 */ }
const merged = new Map(previous.map((x) => [x.id, x]))
for (const r of results) merged.set(r.id, r)
const finalItems = [...merged.values()].sort((a, b) => a.id.localeCompare(b.id))
const manifest = {
  generatedAt: new Date().toISOString(),
  registry: REGISTRY,
  total: finalItems.length,
  totalBytes: finalItems.reduce((n, r) => n + r.archiveBytes, 0),
  items: finalItems
}
writeFileSync(join(VENDOR, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8')
writeFileSync(join(VENDOR, 'manifest.js'), `/* 由 scripts/build-vendor.mjs 生成，请勿直接编辑 */\nwindow.__VENDOR_MANIFEST__ = ${JSON.stringify(manifest, null, 2)};\n`, 'utf8')
console.log(`\n[build] 成功 ${results.length}/${targets.length}，合计 ${(manifest.totalBytes / 1024 / 1024).toFixed(2)} MB`)
console.log('[build] 已更新 vendor/manifest.json 与 vendor/manifest.js')
