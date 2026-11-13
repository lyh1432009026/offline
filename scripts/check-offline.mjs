#!/usr/bin/env node
/**
 * 扫描业务项目构建产物，找出残留的公网外链。
 *
 *   node scripts/check-offline.mjs ./dist
 *   node scripts/check-offline.mjs ./dist --allow=intranet.example.com,cdn.internal
 *   node scripts/check-offline.mjs ./dist --ignore=vendor,legacy --json
 *
 * 判定为安全的地址：相对路径、localhost / 127.* / 10.* / 172.16-31.* / 192.168.*、
 * *.internal / *.local / *.lan，以及常见 XML/JSON 命名空间域名。
 * 发现公网外链时退出码为 1，可直接接进 CI。
 */
import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs'
import { join, resolve, relative, sep, extname } from 'node:path'

const argv = process.argv.slice(2)
const target = resolve(process.cwd(), argv.find((a) => !a.startsWith('--')) || './dist')
const arg = (k, d) => {
  const hit = argv.find((a) => a.startsWith(`--${k}=`))
  return hit ? hit.slice(k.length + 3) : d
}
const ALLOW = new Set(arg('allow', '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean))
const IGNORE = arg('ignore', 'node_modules,.git').split(',').map((s) => s.trim()).filter(Boolean)
const JSON_OUT = argv.includes('--json')

const NS_HOSTS = new Set([
  'www.w3.org', 'schemas.xmlsoap.org', 'json-schema.org', 'www.apache.org',
  'www.mozilla.org', 'github.com', 'opensource.org', 'schema.org',
  'tools.ietf.org', 'www.ietf.org', 'ns.adobe.com', 'purl.org', 'www.openxmlformats.org'
])
const SCAN_EXT = new Set(['.html', '.htm', '.js', '.mjs', '.cjs', '.css', '.json', '.ts', '.vue', '.svg', '.map'])
const MAX_BYTES = 8 * 1024 * 1024
const URL_RE = /(?:https?:)?\/\/[A-Za-z0-9][A-Za-z0-9._-]*(?::\d+)?/g

function isIntranet(host) {
  const h = host.toLowerCase()
  if (ALLOW.has(h) || NS_HOSTS.has(h)) return true
  if (h === 'localhost' || h.endsWith('.localhost')) return true
  if (/\.(internal|local|lan|intranet|corp|test)$/.test(h)) return true
  if (/^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h)) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true
  return false
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (IGNORE.includes(name)) continue
    const full = join(dir, name)
    let st
    try { st = statSync(full) } catch { continue }
    if (st.isDirectory()) walk(full, out)
    else if (SCAN_EXT.has(extname(name).toLowerCase()) && st.size <= MAX_BYTES) out.push(full)
  }
  return out
}

if (!existsSync(target)) {
  console.error(`[check] 目录不存在：${target}`)
  process.exit(2)
}

const findings = []
let fileCount = 0
for (const file of walk(target)) {
  fileCount++
  let text
  try { text = readFileSync(file, 'utf8') } catch { continue }
  const lines = text.split(/\r?\n/)
  lines.forEach((line, i) => {
    URL_RE.lastIndex = 0
    let m
    while ((m = URL_RE.exec(line)) !== null) {
      const raw = m[0]
      const host = raw.replace(/^(?:https?:)?\/\//, '').split(':')[0].split('/')[0]
      if (!host || isIntranet(host)) continue
      findings.push({
        file: relative(target, file).split(sep).join('/'),
        line: i + 1, host, url: raw,
        snippet: line.trim().slice(0, 160)
      })
    }
  })
}

if (JSON_OUT) {
  console.log(JSON.stringify({ target, fileCount, findings }, null, 2))
} else {
  console.log(`[check] 扫描 ${target}，共 ${fileCount} 个文本文件`)
  if (!findings.length) {
    console.log('[check] 通过：未发现公网外链。')
  } else {
    const hosts = [...new Set(findings.map((f) => f.host))]
    console.log(`[check] 发现 ${findings.length} 处公网外链，涉及 ${hosts.length} 个域名：${hosts.join(', ')}\n`)
    const byFile = new Map()
    for (const f of findings) {
      if (!byFile.has(f.file)) byFile.set(f.file, [])
      byFile.get(f.file).push(f)
    }
    for (const [file, list] of byFile) {
      console.log(`  ${file}`)
      for (const f of list.slice(0, 8)) console.log(`    L${f.line}  ${f.url}  ${f.snippet}`)
      if (list.length > 8) console.log(`    ... 另有 ${list.length - 8} 处`)
    }
    console.log('\n[check] 处理建议：把对应资源加入内网离线库，或改为构建期引入；确属内网的域名用 --allow 放行。')
  }
}
process.exit(findings.length ? 1 : 0)
