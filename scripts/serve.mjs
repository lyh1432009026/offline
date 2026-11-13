#!/usr/bin/env node
/**
 * 零依赖静态服务，用于本地预览离线库（也可在内网临时起服务）。
 *
 *   node scripts/serve.mjs                 # http://127.0.0.1:8080
 *   node scripts/serve.mjs --port=9000
 *   node scripts/serve.mjs --host=0.0.0.0 --port=8080   # 允许同事访问
 *
 * 已配置 .mjs / .wasm / 字体 / .tar.gz 等 MIME，并禁用强缓存，改完教程刷新即可看到。
 */
import { createServer } from 'node:http'
import { createReadStream, statSync } from 'node:fs'
import { dirname, extname, resolve, sep, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const arg = (k, d) => {
  const hit = argv.find((a) => a.startsWith(`--${k}=`))
  return hit ? hit.slice(k.length + 3) : d
}
const PORT = Number(arg('port', process.env.PORT || '8080'))
const HOST = arg('host', '127.0.0.1')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.cjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm',
  '.pdf': 'application/pdf',
  '.gz': 'application/gzip',
  '.tgz': 'application/gzip',
  '.zip': 'application/zip',
  '.glb': 'model/gltf-binary',
  '.json5': 'text/plain; charset=utf-8'
}

const server = createServer((req, res) => {
  let pathname
  try {
    pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname)
  } catch {
    res.writeHead(400).end('Bad request')
    return
  }

  let target = resolve(ROOT, pathname.replace(/^\/+/, ''))
  if (target !== ROOT && !target.startsWith(ROOT + sep)) {
    res.writeHead(403).end('Forbidden')
    return
  }

  let st
  try { st = statSync(target) } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 Not Found: ' + pathname)
    console.log(`${req.method} ${pathname} 404`)
    return
  }
  if (st.isDirectory()) {
    target = join(target, 'index.html')
    try { st = statSync(target) } catch {
      res.writeHead(404).end('404 Not Found')
      return
    }
  }

  const type = MIME[extname(target).toLowerCase()] || 'application/octet-stream'
  const headers = {
    'Content-Type': type,
    'Content-Length': st.size,
    'Cache-Control': 'no-cache, must-revalidate',
    'Access-Control-Allow-Origin': '*',
    'X-Content-Type-Options': 'nosniff'
  }
  res.writeHead(200, headers)
  if (req.method === 'HEAD') { res.end(); return }
  const stream = createReadStream(target)
  stream.on('error', () => res.destroy())
  stream.pipe(res)
  console.log(`${req.method} ${pathname} 200 (${(st.size / 1024).toFixed(1)} KB)`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[serve] 端口 ${PORT} 已被占用，换一个：node scripts/serve.mjs --port=${PORT + 1}`)
  } else {
    console.error('[serve] 启动失败：', err.message)
  }
  process.exit(1)
})

server.listen(PORT, HOST, () => {
  console.log(`[serve] 离线库已启动： http://${HOST}:${PORT}/`)
  console.log(`[serve] 根目录：${ROOT}`)
  console.log('[serve] Ctrl+C 停止')
})
