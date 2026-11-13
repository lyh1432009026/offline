/* 由 scripts/sync.mjs 生成，请勿直接编辑；修改 catalog.json 后重新运行 */
window.__OFFLINE_HUB__ = {
  "meta": {
    "name": "前端内网离线资源库",
    "slug": "offline-hub",
    "version": "1.0.0",
    "updated": "2026-11-12",
    "registry": "https://registry.npmmirror.com",
    "description": "把常用前端组件中默认走公网的 CDN 资源统一收口到内网，提供可下载资源包、逐组件使用教程与接入片段。",
    "notice": "本库只分发开源组件的静态资源与接入方法，不包含任何地图数据、账号密钥或在线服务凭证。"
  },
  "categories": [
    {
      "id": "solution",
      "name": "完整方案"
    },
    {
      "id": "editor",
      "name": "编辑器"
    },
    {
      "id": "icon",
      "name": "图标字体"
    },
    {
      "id": "chart",
      "name": "图表渲染"
    },
    {
      "id": "doc",
      "name": "文档预览"
    },
    {
      "id": "media",
      "name": "音视频"
    },
    {
      "id": "gis",
      "name": "三维地图"
    },
    {
      "id": "util",
      "name": "工具服务"
    }
  ],
  "items": [
    {
      "id": "vditor",
      "name": "Vditor",
      "category": "editor",
      "package": "vditor",
      "version": "4.0.1",
      "license": "MIT",
      "prefetch": true,
      "summary": "浏览器端 Markdown 编辑器，默认从 unpkg 动态加载 Lute 引擎、i18n、主题与图标。",
      "cdnHosts": [
        "unpkg.com",
        "cdn.jsdelivr.net"
      ],
      "size": "展开 21.9 MB / 下载包 5.6 MB · 530 个文件",
      "extract": [
        "package/dist/**"
      ],
      "files": [
        "dist/index.css",
        "dist/js/lute/lute.min.js",
        "dist/js/i18n/zh_CN.js",
        "dist/js/highlight.js/*",
        "dist/images/*"
      ],
      "install": "cp -r vendor/vditor/4.0.1/dist public/vditor",
      "snippet": "import Vditor from 'vditor'\nimport 'vditor/dist/index.css'\n\nconst editor = new Vditor('vditor', {\n  height: 520,\n  mode: 'ir',\n  cdn: '/vditor',\n  upload: { url: '/api/upload' },\n  cache: { enable: true, id: 'draft' }\n})",
      "tutorial": [
        {
          "title": "取出资源包并放到 public",
          "body": "在本库下载 vditor-4.0.1.tar.gz，解压后把整个 dist 目录拷到 Vue 项目的 public/vditor/。Vite 不会编译 public 下的文件，路径会原样保留，这一点必须保证。",
          "code": "public/\n└── vditor/\n    ├── index.css\n    ├── js/lute/lute.min.js\n    ├── js/i18n/zh_CN.js\n    └── images/"
        },
        {
          "title": "把 cdn 指到本地目录",
          "body": "cdn 的值是 dist 目录本身，不是其父目录。Vditor 会在此路径下自行拼接 js/lute/lute.min.js 等子路径。建议通过环境变量注入，方便内外网切换。",
          "code": "new Vditor('vditor', {\n  cdn: import.meta.env.VITE_VDITOR_CDN || '/vditor'\n})"
        },
        {
          "title": "清理体积",
          "body": "dist 内含 Lute 引擎与流程图、思维导图、数学公式等模块源码，4.0.1 展开约 22 MB（下载包压缩后约 5.6 MB）。确认不用的模块可以删掉对应源码目录，并在 Nginx 开启 gzip 或 brotli。不要删 index.css 与 lute.min.js。",
          "code": "# nginx\nlocation /vditor/ { gzip on; gzip_types text/css application/javascript; }"
        },
        {
          "title": "收口其余外部请求",
          "body": "upload.url 改为内网上传接口；preview.hljs 主题的 CSS、preview.math 的 KaTeX、mermaid、emoji 图片都要指向本地；外链图片由后端代理或禁用。cache 走 localStorage，无网络依赖可保留。",
          "code": "preview: {\n  hljs: { style: 'github' },\n  math: { engine: 'KaTeX' },\n  actions: []\n}"
        }
      ],
      "pitfalls": [
        "漏拷 js/i18n/zh_CN.js 会导致编辑器白屏并提示远程加载失败",
        "cdn 路径写成 /vditor/dist 会重复拼接目录，导致 404",
        "本地 cdn 的资源版本必须与 npm 安装的 vditor 版本一致"
      ],
      "verify": "断网后打开编辑器，DevTools Network 过滤 unpkg / jsdelivr 应为 0 条；输入 Markdown 能即时渲染。"
    },
    {
      "id": "md-editor-v3",
      "name": "md-editor-v3",
      "category": "editor",
      "package": "md-editor-v3",
      "version": "7.1.0",
      "license": "MIT",
      "prefetch": true,
      "summary": "Vue 3 Markdown 编辑器，代码高亮、公式、流程图等扩展默认从公网 CDN 拉取。",
      "cdnHosts": [
        "cdn.jsdelivr.net",
        "unpkg.com"
      ],
      "size": "展开 0.6 MB / 下载包 0.1 MB · 40 个文件",
      "extract": [
        "package/lib/**",
        "package/package.json"
      ],
      "files": [
        "lib/style.css",
        "lib/preview.css"
      ],
      "install": "npm i md-editor-v3@7.1.0（内网私仓）",
      "snippet": "import { config } from 'md-editor-v3'\nimport 'md-editor-v3/lib/style.css'\n\nconfig({\n  editorExtensions: {\n    highlight: { js: '/vendor/highlight.js/highlight.min.js' },\n    katex: {\n      js: '/vendor/katex/katex.min.js',\n      css: '/vendor/katex/katex.min.css'\n    }\n  }\n})",
      "tutorial": [
        {
          "title": "安装并引入本地样式",
          "body": "从内网 npm 私仓安装固定版本，入口文件同时引入 lib/style.css。只装 JS 不引 CSS 会表现为工具栏错乱。",
          "code": "import 'md-editor-v3/lib/style.css'\nimport { MdEditor } from 'md-editor-v3'"
        },
        {
          "title": "用 config 覆盖扩展地址",
          "body": "在 main.ts 中、挂载应用之前调用 config()，把 highlight、katex、mermaid、prettier 等扩展的 js/css 全部指向内网 vendor 路径。这一步是离线化的关键。",
          "code": "import { config } from 'md-editor-v3'\nconfig({ editorExtensions: { /* 全部本地路径 */ } })"
        },
        {
          "title": "用不到就关掉扩展",
          "body": "如果业务不需要公式或流程图，通过 noMermaid、noKatex 之类的开关直接禁用，比本地化这些大块资源更省事，也减少动态 import 的 chunk 缺失风险。",
          "code": "<MdEditor v-model=\"text\" :noMermaid=\"true\" />"
        },
        {
          "title": "处理上传与图片",
          "body": "onUploadImg 回调改为内网上传接口；正文中的外链图片由后端代理抓取，避免页面在离线环境产生 ERR_NAME_NOT_RESOLVED。",
          "code": "const onUploadImg = async (files, callback) => {\n  const urls = await Promise.all(files.map(uploadToIntranet))\n  callback(urls)\n}"
        }
      ],
      "pitfalls": [
        "config() 必须在组件渲染前调用，放在 onMounted 里无效",
        "扩展 JS 的版本要与编辑器期望的 API 兼容，跨大版本容易报错",
        "主题 CSS 与代码块高亮 CSS 不是同一个文件，两者都要本地引入"
      ],
      "verify": "断网后预览一段含代码块与公式的 Markdown，高亮与公式均正常，Network 无 jsdelivr 请求。"
    },
    {
      "id": "monaco-editor",
      "name": "Monaco Editor",
      "category": "editor",
      "package": "monaco-editor",
      "version": "0.57.0",
      "license": "MIT",
      "prefetch": true,
      "summary": "VS Code 同款代码编辑器，loader 默认从 CDN 加载 min/vs 与各类语言 Worker。",
      "cdnHosts": [
        "cdn.jsdelivr.net",
        "unpkg.com"
      ],
      "size": "展开 24.4 MB / 下载包 5.5 MB · 152 个文件",
      "extract": [
        "package/min/vs/**",
        "package/package.json"
      ],
      "files": [
        "min/vs/loader.js",
        "min/vs/editor/editor.main.js",
        "min/vs/editor/editor.main.css",
        "min/vs/editor/editor.worker.js",
        "min/vs/assets/*.worker*.js",
        "min/vs/language/*",
        "min/vs/basic-languages/*"
      ],
      "install": "cp -r vendor/monaco-editor/0.57.0/min/vs public/monaco/vs",
      "snippet": "import * as monaco from 'monaco-editor'\nimport editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'\nimport jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'\n\nself.MonacoEnvironment = {\n  getWorker(_, label) {\n    if (label === 'json') return new jsonWorker()\n    return new editorWorker()\n  }\n}\nmonaco.editor.create(document.getElementById('code'), { value: '', language: 'json' })",
      "tutorial": [
        {
          "title": "整包拷贝 min/vs",
          "body": "Monaco 的 loader.js 会按相对路径继续加载 editor.main.js、CSS、各语言贡献点与 Worker，因此必须整包拷贝，单独下载 Cesium.js 式的单文件做法在这里必然报错。",
          "code": "public/monaco/vs/\n├── loader.js\n├── editor/editor.main.js\n├── editor/editor.worker.js\n├── assets/*.worker*.js\n├── language/\n└── basic-languages/"
        },
        {
          "title": "Vite 工程用 ESM + ?worker",
          "body": "推荐用 monaco-editor 的 ESM 入口配合 Vite 的 ?worker 导入，让构建器把 Worker 一起打进产物，避免运行时路径问题。需要哪种语言就注册哪种 Worker。",
          "code": "import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'"
        },
        {
          "title": "非构建场景改 loader 路径",
          "body": "若用原生 script 引入，加载 loader.js 后调用 loader.config 指定 vs 目录。注意 0.5x 起 min/vs 内是带 hash 的 ESM chunk（Worker 形如 assets/editor.worker-XXXX.js），旧教程里的 base/worker/workerMain.js 已不存在；手写 getWorkerUrl 需指向带 hash 的文件且升级即失效，因此内网优先采用上一步的 Vite ?worker 方案。Worker 不能跨源，也不能用 file:// 打开。",
          "code": "monaco.loader.config({ paths: { vs: \"/monaco/vs\" } })\n// Worker 示例：/monaco/vs/assets/editor.worker-_vAIFJDs.js"
        },
        {
          "title": "裁剪语言包",
          "body": "只保留项目实际用到的语言目录（如 json、typescript、css），可以显著减小发布体积。裁剪后务必验证对应语言的补全与校验仍然可用。",
          "code": "# 保留\nvs/language/json/  vs/language/typescript/  vs/basic-languages/"
        }
      ],
      "pitfalls": [
        "Worker 路径或版本不匹配时编辑器能打开但没有语法校验，容易被误判为正常",
        "CSS 内的字体与图标相对路径要一起保留",
        "Nginx 需为 .js/.css/.ttf 返回正确 MIME，否则 Worker 加载被 Strict MIME 拦截"
      ],
      "verify": "断网打开 JSON 编辑器，故意写错一个逗号应出现校验波浪线；Network 无外网域名。"
    },
    {
      "id": "codemirror",
      "name": "CodeMirror 6",
      "category": "editor",
      "package": "codemirror",
      "version": "6.0.2",
      "license": "MIT",
      "prefetch": true,
      "summary": "纯 ESM 代码编辑器，无运行时 CDN，是新建内网项目时最省事的编辑器选型。",
      "cdnHosts": [],
      "size": "展开 0.0 MB / 下载包 0.0 MB · 9 个文件",
      "extract": [
        "package/**"
      ],
      "files": [],
      "install": "npm i codemirror @codemirror/lang-javascript @codemirror/theme-one-dark",
      "snippet": "import { EditorView, basicSetup } from 'codemirror'\nimport { javascript } from '@codemirror/lang-javascript'\nimport { oneDark } from '@codemirror/theme-one-dark'\n\nnew EditorView({\n  doc: 'const a = 1',\n  extensions: [basicSetup, javascript(), oneDark, EditorView.lineWrapping],\n  parent: document.querySelector('#code')\n})",
      "tutorial": [
        {
          "title": "按需安装模块",
          "body": "CodeMirror 6 拆包设计，基础包只含核心；语言支持、主题、搜索等都要显式安装。这正是它天然离线的来源——所有代码都在构建产物里。",
          "code": "npm i codemirror @codemirror/view @codemirror/state @codemirror/lang-javascript"
        },
        {
          "title": "在 Vue 中管理生命周期",
          "body": "在 onMounted 创建 EditorView，在 onBeforeUnmount 调用 view.destroy()，避免路由切换后残留实例。",
          "code": "let view\nonMounted(() => { view = new EditorView({ parent: el.value }) })\nonBeforeUnmount(() => view?.destroy())"
        },
        {
          "title": "自定义主题",
          "body": "用 EditorView.theme 写样式，不要用外链 CSS 主题包。这样连字体都走系统字体栈，彻底无外部请求。",
          "code": "const theme = EditorView.theme({ '&': { fontSize: '13px' } })"
        }
      ],
      "pitfalls": [
        "不装语言包就没有语法高亮，常被误认为离线失败",
        "从 CodeMirror 5 迁移时 API 不兼容，5.x 的部分资源仍走 CDN"
      ],
      "verify": "断网打开编辑器，输入代码有高亮与括号匹配，Network 请求全部指向本站。"
    },
    {
      "id": "wangeditor",
      "name": "wangEditor",
      "category": "editor",
      "package": "@wangeditor/editor",
      "version": "5.1.23",
      "license": "MIT",
      "prefetch": true,
      "summary": "国产富文本编辑器，npm 包本身完全离线，主要外链风险来自上传接口与自定义内容。",
      "cdnHosts": [],
      "size": "展开 6.9 MB / 下载包 2.0 MB · 22 个文件",
      "extract": [
        "package/dist/**",
        "package/package.json"
      ],
      "files": [
        "dist/css/style.css"
      ],
      "install": "npm i @wangeditor/editor @wangeditor/editor-for-vue",
      "snippet": "import '@wangeditor/editor/dist/css/style.css'\nimport { Editor, Toolbar } from '@wangeditor/editor-for-vue'\n\nconst editorConfig = {\n  MENU_CONF: {\n    uploadImage: { server: '/api/upload', fieldName: 'file' }\n  }\n}",
      "tutorial": [
        {
          "title": "从私仓安装并引入样式",
          "body": "安装 editor 与 editor-for-vue 两个包，样式文件必须单独引入。整个包没有运行时 CDN 请求。",
          "code": "import '@wangeditor/editor/dist/css/style.css'"
        },
        {
          "title": "配置内网上传",
          "body": "MENU_CONF.uploadImage.server 与 uploadVideo.server 改为内网地址，并按后端返回格式实现 customInsert 或调整响应结构。",
          "code": "MENU_CONF: { uploadImage: { server: '/api/upload' } }"
        },
        {
          "title": "清理正文外链内容",
          "body": "历史数据里粘贴的公网图片、视频 iframe、字体链接清洗一遍，或由后端代理，否则页面仍会向外网发请求。",
          "code": "editorConfig.customPaste = (editor, event) => { /* 清洗后再插入 */ }"
        }
      ],
      "pitfalls": [
        "Vue 组件销毁时需调用 editor.destroy()",
        "@wangeditor/editor 与 editor-for-vue 版本需匹配"
      ],
      "verify": "断网新建、编辑、上传图片全流程可用，Network 仅本站域名。"
    },
    {
      "id": "iconify",
      "name": "Iconify 离线图标集",
      "category": "icon",
      "package": "@iconify-json/ri",
      "version": "1.2.10",
      "license": "MIT（各图标集许可见其自身声明）",
      "prefetch": true,
      "summary": "@iconify/vue 的 Icon 组件默认在线请求 api.iconify.design，需注册本地图标集才能离线。",
      "cdnHosts": [
        "api.iconify.design",
        "api.simplesvg.com",
        "api.unisvg.com"
      ],
      "size": "展开 1.1 MB / 下载包 0.3 MB · 9 个文件",
      "extract": [
        "package/**"
      ],
      "files": [
        "icons.json",
        "info.json"
      ],
      "install": "npm i -D @iconify-json/ri（只装用到的图标集）",
      "snippet": "import { addCollection, Icon } from '@iconify/vue'\nimport riIcons from '@iconify-json/ri/icons.json'\n\naddCollection(riIcons)\n// 之后 <Icon icon=\"ri:home-line\" /> 不再发起网络请求",
      "tutorial": [
        {
          "title": "只装用得到的图标集",
          "body": "按项目实际图标前缀安装 @iconify-json/ri、@iconify-json/mdi 等。不要装 @iconify/json 全量包（约 130 MB），内网传输与构建都很不划算。",
          "code": "npm i -D @iconify-json/ri @iconify-json/line-md"
        },
        {
          "title": "在入口注册本地集合",
          "body": "新建 iconify-loader.ts，用 addCollection 逐个注册，并在 main.ts 第一行引入，保证任何图标渲染前已完成注册。",
          "code": "import { addCollection } from '@iconify/vue'\nimport riIcons from '@iconify-json/ri/icons.json'\naddCollection(riIcons)"
        },
        {
          "title": "或用构建期内联",
          "body": "unplugin-icons 会把用到的图标在构建时转成组件，运行时零请求、零图标数据，是更彻底的方案；代价是图标名必须写成静态字符串。",
          "code": "import IconHome from '~icons/ri/home-line'"
        },
        {
          "title": "核对图标前缀",
          "body": "图标名前缀必须与注册的集合 prefix 一致，拼错时组件会再次尝试在线查找，离线环境表现为图标空白。",
          "code": "<Icon icon=\"ri:home-line\" />"
        }
      ],
      "pitfalls": [
        "动态拼接的图标名无法被构建期方案识别",
        "新增图标集后需重新注册并重启开发服务",
        "混用在线与离线图标时很难从现象上区分问题来源"
      ],
      "verify": "断网后打开含图标页面，Network 过滤 iconify.design 应为 0 条，图标全部显示。"
    },
    {
      "id": "fontsource",
      "name": "自托管 Web 字体",
      "category": "icon",
      "package": "@fontsource/inter",
      "version": "5.3.0",
      "license": "OFL-1.1",
      "prefetch": true,
      "summary": "用 @fontsource 系列替代 Google Fonts 等字体 CDN，把 woff2 随构建产物一起发布。",
      "cdnHosts": [
        "fonts.googleapis.com",
        "fonts.gstatic.com"
      ],
      "size": "展开 4.1 MB / 下载包 3.9 MB · 413 个文件",
      "extract": [
        "package/files/**",
        "package/*.css",
        "package/package.json"
      ],
      "files": [
        "400.css",
        "500.css",
        "700.css",
        "files/*"
      ],
      "install": "npm i @fontsource/inter",
      "snippet": "/* main.css */\n@import '@fontsource/inter/400.css';\n@import '@fontsource/inter/500.css';\n@import '@fontsource/inter/700.css';\n\n:root { font-family: 'Inter', 'Microsoft YaHei', sans-serif; }",
      "tutorial": [
        {
          "title": "用 npm 包替换字体 CDN 链接",
          "body": "删除 index.html 里所有 fonts.googleapis.com / fonts.gstatic.com 的 link 标签，改为在样式入口 import @fontsource 对应字重的 CSS。",
          "code": "import '@fontsource/inter/400.css'"
        },
        {
          "title": "保证 woff2 随产物发布",
          "body": "构建器会自动处理 CSS 内的 url()。若手工放到 public，必须连 files/ 目录一起拷，保持 CSS 里的相对路径不变。",
          "code": "dist/assets/\n├── index-abc.css\n└── inter-latin-400-normal-xyz.woff2"
        },
        {
          "title": "中文字体做子集化",
          "body": "中文字体动辄数 MB，切勿整包引入。优先使用系统字体栈；确需定制时用 fonttools pyftsubset 按项目字符集合裁出子集，再以 @font-face 本地引入。",
          "code": "pyftsubset SourceHanSansSC.ttf --text-file=chars.txt --flavor=woff2"
        },
        {
          "title": "配置字体 MIME 与缓存",
          "body": "Nginx 为 .woff2 返回 font/woff2，跨源场景补 Access-Control-Allow-Origin；带 hash 的字体文件可长缓存。",
          "code": "types { font/woff2 woff2; }"
        }
      ],
      "pitfalls": [
        "CSS 内 url() 指向的字体是二级引用，最容易漏拷",
        "中文字体整包会拖慢首屏数秒",
        "Element Plus 等组件库自带图标字体，也要一并检查"
      ],
      "verify": "断网刷新，Network 过滤 googleapis / gstatic 为 0 条，字体渲染与联网时一致。"
    },
    {
      "id": "echarts",
      "name": "ECharts",
      "category": "chart",
      "package": "echarts",
      "version": "6.1.0",
      "license": "Apache-2.0",
      "prefetch": true,
      "summary": "图表库本身纯离线，风险在地图 GeoJSON、在线地图扩展与主题图片资源。",
      "cdnHosts": [
        "cdn.jsdelivr.net",
        "api.map.baidu.com"
      ],
      "size": "展开 50.7 MB / 下载包 10.2 MB · 23 个文件",
      "extract": [
        "package/dist/**",
        "package/package.json"
      ],
      "files": [
        "dist/echarts.min.js"
      ],
      "install": "npm i echarts@6.1.0",
      "snippet": "import * as echarts from 'echarts/core'\nimport { BarChart, MapChart } from 'echarts/charts'\nimport { GridComponent, TooltipComponent, GeoComponent } from 'echarts/components'\nimport { CanvasRenderer } from 'echarts/renderers'\nimport chinaJson from '/vendor/geo/china.json'\n\necharts.use([BarChart, MapChart, GridComponent, TooltipComponent, GeoComponent, CanvasRenderer])\necharts.registerMap('china', chinaJson)",
      "tutorial": [
        {
          "title": "按需引入减小体积",
          "body": "使用 echarts/core + use() 注册所需图表与组件，避免全量包，也让构建产物完全自包含。",
          "code": "import * as echarts from 'echarts/core'\necharts.use([BarChart, GridComponent, CanvasRenderer])"
        },
        {
          "title": "把 GeoJSON 放进内网",
          "body": "地图数据不要从公网接口拉取，把 JSON 放到 public/vendor/geo/ 下，启动前用 registerMap 注册。JSON 版本与展示口径由团队统一维护。",
          "code": "const geo = await fetch('/vendor/geo/china.json').then(r => r.json())\necharts.registerMap('china', geo)"
        },
        {
          "title": "移除在线地图扩展",
          "body": "echarts/extension/bmap.js 会加载百度地图 JS API，echarts-gl 的部分示例也引用在线纹理。内网要么不用，要么改为本地已授权的地图服务。",
          "code": "// 不要 import 'echarts/extension/bmap'"
        },
        {
          "title": "检查配置里的图片外链",
          "body": "graphic、series 的 symbol、markPoint 图标、自定义主题 JSON 中可能写死 https 图片地址，统一换成本地静态资源。",
          "code": "symbol: 'image:///assets/marker.png'"
        }
      ],
      "pitfalls": [
        "registerMap 前使用了 map 类型会报地图不存在",
        "GeoJSON 文件较大，注意 Nginx 是否允许 .json 的 MIME 与 gzip",
        "散点坐标与底图坐标系不一致会造成整体偏移"
      ],
      "verify": "断网打开全部图表页，地图与图标正常，Network 无外网域名。"
    },
    {
      "id": "highlightjs",
      "name": "highlight.js",
      "category": "chart",
      "package": "highlight.js",
      "version": "11.12.0",
      "license": "BSD-3-Clause",
      "prefetch": true,
      "summary": "代码高亮库，常见失效原因是主题 CSS 用了 cdnjs 外链。",
      "cdnHosts": [
        "cdnjs.cloudflare.com",
        "cdn.jsdelivr.net"
      ],
      "size": "展开 2.7 MB / 下载包 0.5 MB · 910 个文件",
      "extract": [
        "package/styles/**",
        "package/lib/**",
        "package/package.json"
      ],
      "files": [
        "styles/github.css",
        "styles/github-dark.css",
        "lib/common.js"
      ],
      "install": "npm i highlight.js@11.12.0",
      "snippet": "import hljs from 'highlight.js/lib/common'\nimport '/vendor/highlight.js/styles/github.css'\n\ndocument.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el))",
      "tutorial": [
        {
          "title": "删除主题 CDN 链接",
          "body": "很多项目只在 index.html 用 link 引了主题 CSS，这是离线后代码「有结构无配色」的根因。把 styles/*.css 拷到内网并在入口引入。",
          "code": "import 'highlight.js/styles/github.css'"
        },
        {
          "title": "按需注册语言",
          "body": "用 lib/common 或逐语言注册，避免全量包。Vditor、md-editor-v3 等编辑器若自带高亮，注意不要重复引入产生两套样式。",
          "code": "import hljs from 'highlight.js/lib/core'\nimport javascript from 'highlight.js/lib/languages/javascript'\nhljs.registerLanguage('javascript', javascript)"
        },
        {
          "title": "在正确时机执行高亮",
          "body": "SPA 需在数据渲染完成后的 nextTick 调用 highlightElement，且对同一节点只处理一次（用 dataset 标记）。",
          "code": "await nextTick()\nif (!el.dataset.highlighted) { hljs.highlightElement(el); el.dataset.highlighted = 'yes' }"
        }
      ],
      "pitfalls": [
        "主题 CSS 未引入时不会报错，只是没有颜色",
        "highlightAll 会重复处理已高亮节点",
        "部分主题引用外部字体或背景图，需检查 CSS 内 url()"
      ],
      "verify": "断网打开含代码块页面，配色正确，Network 无 cdnjs 请求。"
    },
    {
      "id": "katex",
      "name": "KaTeX",
      "category": "chart",
      "package": "katex",
      "version": "0.19.1",
      "license": "MIT",
      "prefetch": true,
      "summary": "数学公式渲染，CSS 依赖同目录 fonts/，只拷 CSS 会缺符号。",
      "cdnHosts": [
        "cdn.jsdelivr.net",
        "cdnjs.cloudflare.com"
      ],
      "size": "展开 2.8 MB / 下载包 1.2 MB · 84 个文件",
      "extract": [
        "package/dist/**",
        "package/package.json"
      ],
      "files": [
        "dist/katex.min.css",
        "dist/katex.min.js",
        "dist/fonts/*"
      ],
      "install": "cp -r vendor/katex/0.19.1/dist public/vendor/katex",
      "snippet": "import katex from 'katex'\nimport 'katex/dist/katex.min.css'\n\nconst html = katex.renderToString('E = mc^2', {\n  throwOnError: false,\n  output: 'html'\n})",
      "tutorial": [
        {
          "title": "整目录拷贝",
          "body": "katex.min.css 内以 url(fonts/KaTeX_Main-Regular.woff2) 引用同级 fonts 目录，必须连同 fonts/ 一起发布，且保持相对层级。",
          "code": "public/vendor/katex/\n├── katex.min.css\n├── katex.min.js\n└── fonts/  (不可省略)"
        },
        {
          "title": "通过 npm 引入更省心",
          "body": "Vite 项目直接 import 'katex/dist/katex.min.css'，构建器会自动把字体打进产物；手工放 public 时才需要自己保证目录结构。",
          "code": "import 'katex/dist/katex.min.css'"
        },
        {
          "title": "与编辑器扩展对齐",
          "body": "Vditor / md-editor-v3 的公式扩展若单独指向 vendor 下的 KaTeX，要保证与主应用版本一致，避免两套字体与 CSS 冲突。",
          "code": "editorExtensions: { katex: { css: '/vendor/katex/katex.min.css' } }"
        }
      ],
      "pitfalls": [
        "漏拷 fonts/ 时普通字符正常但数学符号显示异常",
        "woff2/ttf MIME 未配置会被浏览器拒绝加载",
        "output: 'mathml' 与 'html' 的字体依赖不同"
      ],
      "verify": "断网渲染含积分、矩阵、希腊字母的公式，符号完整无方框。"
    },
    {
      "id": "mermaid",
      "name": "Mermaid",
      "category": "chart",
      "package": "mermaid",
      "version": "12.3.0",
      "license": "MIT",
      "prefetch": true,
      "summary": "流程图/时序图渲染，现代版本会动态 import 多个 chunk，容易漏发布。",
      "cdnHosts": [
        "cdn.jsdelivr.net",
        "unpkg.com"
      ],
      "size": "展开 117.9 MB / 下载包 24.7 MB · 1402 个文件",
      "extract": [
        "package/dist/**",
        "package/package.json"
      ],
      "files": [
        "dist/mermaid.esm.min.mjs",
        "dist/chunks/**"
      ],
      "install": "npm i mermaid@12.3.0",
      "snippet": "import mermaid from 'mermaid'\n\nmermaid.initialize({\n  startOnLoad: false,\n  securityLevel: 'strict',\n  theme: 'default'\n})\nconst { svg } = await mermaid.render('graph-1', 'graph TD; A-->B')",
      "tutorial": [
        {
          "title": "走构建器而不是 CDN",
          "body": "从 npm 安装并用 ESM 引入，让 Vite 处理动态 import。若手工拷贝 dist，务必把 chunks/ 目录一起发布，否则运行时会 404。",
          "code": "dist/\n├── mermaid.esm.min.mjs\n└── chunks/mermaid.core/…  (必须一起)"
        },
        {
          "title": "关闭自动扫描",
          "body": "建议 startOnLoad: false，由业务代码在内容就绪后显式调用 render，避免路由切换时重复渲染或找不到容器。",
          "code": "mermaid.initialize({ startOnLoad: false })"
        },
        {
          "title": "固定 base 路径",
          "body": "内网部署在子路径时，Vite 的 base 必须与实际访问路径一致，否则动态 chunk 会拼到根路径去。",
          "code": "export default defineConfig({ base: '/offline-hub/' })"
        },
        {
          "title": "检查字体与图标",
          "body": "部分主题引用外部字体与图标资源，统一改为本地或系统字体；自定义主题 CSS 也要放进产物。",
          "code": "themeVariables: { fontFamily: 'Microsoft YaHei, sans-serif' }"
        }
      ],
      "pitfalls": [
        "只发主文件不发 chunk 是最常见的离线失败原因",
        "render() 的 id 重复会导致 SVG 覆盖",
        "securityLevel 设为 loose 时需评估注入风险"
      ],
      "verify": "断网渲染流程图与时序图，SVG 正常且 Network 全部指向本站。"
    },
    {
      "id": "pdfjs",
      "name": "pdf.js",
      "category": "doc",
      "package": "pdfjs-dist",
      "version": "6.5.438",
      "license": "Apache-2.0",
      "prefetch": true,
      "summary": "PDF 预览，Worker 必须同源；6.x 的 npm 包已不含 cmaps 与 standard_fonts，处理中文 CID 字体时需另行补齐。",
      "cdnHosts": [
        "cdn.jsdelivr.net",
        "unpkg.com",
        "mozilla.github.io"
      ],
      "size": "展开 14.4 MB / 下载包 3.0 MB · 100 个文件",
      "extract": [
        "package/build/**",
        "package/web/**",
        "package/package.json"
      ],
      "files": [
        "build/pdf.mjs",
        "build/pdf.worker.mjs",
        "build/pdf.worker.min.mjs",
        "web/pdf_viewer.mjs",
        "web/pdf_viewer.css"
      ],
      "install": "cp -r vendor/pdfjs/6.5.438/{build,web} public/pdfjs/",
      "snippet": "import * as pdfjsLib from \"pdfjs-dist\"\nimport workerUrl from \"pdfjs-dist/build/pdf.worker.min.mjs?url\"\n\npdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl\n\nconst task = pdfjsLib.getDocument({\n  url: \"/docs/demo.pdf\"\n  // 需处理 CID 字体时，先补齐 cmaps/ 与 standard_fonts/ 再启用：\n  // cMapUrl: \"/pdfjs/web/cmaps/\", cMapPacked: true,\n  // standardFontDataUrl: \"/pdfjs/web/standard_fonts/\"\n})\nconst pdf = await task.promise",
      "tutorial": [
        {
          "title": "确认 worker 与主库版本一致",
          "body": "pdf.worker.mjs 必须与 pdf.mjs 来自同一个 npm 包。版本错配会直接抛错且难以定位，不要从别处单独下载 worker。",
          "code": "pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/build/pdf.worker.mjs'"
        },
        {
          "title": "按需补齐 cmaps 与标准字体",
          "body": "重要：pdfjs-dist 6.x 的 npm 包只含 build/ 与 web/ 的 viewer 文件，不含 cmaps/ 与 standard_fonts/。若只预览内部生成的文本型 PDF，可省略；若遇到中文 CID 字体乱码，需从 pdf.js 官方 prebuilt 发布包（GitHub Releases 的 pdfjs-*-dist.zip）取出这两个目录，放到 vendor/pdfjs/<版本>/web/ 下，再启用 cMapUrl 与 standardFontDataUrl。",
          "code": "getDocument({\n  cMapUrl: \"/pdfjs/web/cmaps/\", cMapPacked: true,\n  standardFontDataUrl: \"/pdfjs/web/standard_fonts/\"\n})"
        },
        {
          "title": "用 HTTP 服务而不是 file://",
          "body": "Worker 在 file:// 协议下会被浏览器当作跨源请求而拒绝。内网必须用 Nginx 或本地静态服务发布。",
          "code": "# 不要双击 index.html 调试 pdf.js"
        },
        {
          "title": "按需裁剪",
          "body": "若只处理内部生成的 PDF，可评估去掉 legacy 构建、viewer 与 source map 等多余文件；按需补齐的 cmaps 目录不要漏拷。",
          "code": "public/pdfjs/\n├── build/   (pdf.mjs + pdf.worker.mjs)\n└── web/     (viewer；cmaps/ 与 standard_fonts/ 按需补齐)"
        }
      ],
      "pitfalls": [
        "只拷 pdf.mjs 不拷 worker，页面卡在 loading",
        "中文 CID 字体乱码时，先确认是否已从官方 prebuilt 包补齐 cmaps（npm 包不含）",
        ".mjs 若被服务器返回 text/plain 会被 Strict MIME 拦截"
      ],
      "verify": "断网打开一份含中文的 PDF，文字可复制、无方框，Network 无外网域名。"
    },
    {
      "id": "docx-preview",
      "name": "docx-preview",
      "category": "doc",
      "package": "docx-preview",
      "version": "0.4.1",
      "license": "Apache-2.0",
      "prefetch": true,
      "summary": "在浏览器渲染 docx，npm 包本身离线，样式与字体需本地化。",
      "cdnHosts": [],
      "size": "展开 0.9 MB / 下载包 0.2 MB · 10 个文件",
      "extract": [
        "package/dist/**",
        "package/package.json"
      ],
      "files": [
        "dist/docx-preview.min.js"
      ],
      "install": "npm i docx-preview@0.4.1",
      "snippet": "import { renderAsync } from 'docx-preview'\n\nawait renderAsync(arrayBuffer, container, null, {\n  className: 'docx',\n  inWrapper: true,\n  ignoreWidth: false,\n  experimental: true\n})",
      "tutorial": [
        {
          "title": "安装并引入",
          "body": "从内网私仓安装，用 renderAsync 把 ArrayBuffer 渲染到容器。包本身不发起任何网络请求。",
          "code": "import { renderAsync } from 'docx-preview'"
        },
        {
          "title": "补齐样式",
          "body": "渲染结果依赖默认样式表，若项目重置了全局 CSS，需要为容器补一套段落、表格、列表样式，否则版式会明显失真。",
          "code": ".docx-wrapper { background: #fff; padding: 24px; }"
        },
        {
          "title": "处理文档内字体与图片",
          "body": "docx 内若引用了系统中不存在的字体，会回退导致换行变化；图片一般内嵌在包内，无需额外请求。内网机器建议预装常用中文字体。",
          "code": "/* 指定回退字体栈 */\n.docx { font-family: 'SimSun', 'Microsoft YaHei', serif; }"
        },
        {
          "title": "大文档加保护",
          "body": "几十页以上文档建议分片或加 loading 与超时，避免主线程长时间阻塞。",
          "code": "await Promise.race([renderAsync(buf, el), timeout(15000)])"
        }
      ],
      "pitfalls": [
        "复杂域代码、批注、SmartArt 支持有限",
        "全局 CSS reset 会破坏文档版式",
        "文档内嵌的外链图片仍会产生外部请求"
      ],
      "verify": "断网上传并预览一份含表格与图片的 docx，渲染完成且 Network 无外网请求。"
    },
    {
      "id": "xlsx",
      "name": "SheetJS / ExcelJS",
      "category": "doc",
      "package": "xlsx",
      "version": "0.18.5",
      "license": "Apache-2.0",
      "prefetch": true,
      "summary": "Excel 解析与导出，纯本地计算；注意 npm 上的 xlsx 版本已停更。",
      "cdnHosts": [
        "cdn.sheetjs.com"
      ],
      "size": "展开 5.1 MB / 下载包 1.6 MB · 14 个文件",
      "extract": [
        "package/dist/**",
        "package/package.json"
      ],
      "files": [
        "dist/xlsx.full.min.js"
      ],
      "install": "npm i xlsx@0.18.5 或 exceljs",
      "snippet": "import * as XLSX from 'xlsx'\n\nconst wb = XLSX.read(arrayBuffer, { type: 'array' })\nconst rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])\n\nconst out = XLSX.utils.json_to_sheet(rows)\nXLSX.writeFile({ Sheets: { Sheet1: out }, SheetNames: ['Sheet1'] }, 'report.xlsx')",
      "tutorial": [
        {
          "title": "从内网私仓安装",
          "body": "npm registry 上的 xlsx 停留在 0.18.5，官方新版本改由自家地址分发。内网统一用私仓锁定的版本，不要引 CDN 脚本。",
          "code": "npm i xlsx@0.18.5"
        },
        {
          "title": "评估安全与体积",
          "body": "0.18.5 存在已公开的安全公告，处理不可信上传文件前需评估；新项目可改用 exceljs（仅支持 xlsx，API 更现代）。大文件解析放进 Web Worker。",
          "code": "import ExcelJS from 'exceljs'\nconst wb = new ExcelJS.Workbook()\nawait wb.xlsx.load(buf)"
        },
        {
          "title": "前端导出与中文编码",
          "body": "导出时确保文件流为二进制，中文表头用 UTF-8；若后端生成，直接返回 Content-Disposition 附件更稳妥。",
          "code": "XLSX.writeFile(wb, '报表.xlsx', { bookType: 'xlsx' })"
        }
      ],
      "pitfalls": [
        "解析大文件阻塞主线程，建议 Worker",
        "xls（BIFF）与 xlsx 走不同解析路径，需实测",
        "不要从 cdn.sheetjs.com 引脚本"
      ],
      "verify": "断网导入并导出一份含中文与日期的表格，数据一致、Network 无外网请求。"
    },
    {
      "id": "jspdf",
      "name": "jsPDF 中文字体",
      "category": "doc",
      "package": "jspdf",
      "version": "4.2.1",
      "license": "MIT",
      "prefetch": true,
      "summary": "前端 PDF 导出，内置字体不含中文，必须内嵌 TTF 字体子集。",
      "cdnHosts": [
        "cdnjs.cloudflare.com",
        "fonts.gstatic.com"
      ],
      "size": "展开 28.7 MB / 下载包 3.8 MB · 15 个文件",
      "extract": [
        "package/dist/**",
        "package/package.json"
      ],
      "files": [
        "dist/jspdf.umd.min.js"
      ],
      "install": "npm i jspdf@4.2.1",
      "snippet": "import { jsPDF } from 'jspdf'\nimport fontB64 from '/vendor/fonts/SourceHanSansSC-subset.b64.js'\n\nconst doc = new jsPDF()\ndoc.addFileToVFS('cn.ttf', fontB64)\ndoc.addFont('cn.ttf', 'cn', 'normal')\ndoc.setFont('cn')\ndoc.text('中文标题', 10, 20)\ndoc.save('report.pdf')",
      "tutorial": [
        {
          "title": "制作中文字体子集",
          "body": "jsPDF 只接受 TTF 并以 base64 注册。用 fonttools 按项目实际字符集合裁出子集，避免把几 MB 的完整字体打进前端包。",
          "code": "pyftsubset SourceHanSansSC.ttf --text-file=chars.txt --output-file=cn-subset.ttf"
        },
        {
          "title": "转 base64 并在构建期引入",
          "body": "把 TTF 转成一个导出 base64 字符串的 JS 模块，或由构建器以 ?raw / asset 方式引入。不要运行时再去 fetch 公网字体。",
          "code": "base64 -w0 cn-subset.ttf > cn-subset.b64"
        },
        {
          "title": "注册字体后输出",
          "body": "addFileToVFS → addFont → setFont 三步顺序不能颠倒，否则中文仍是乱码或空白。",
          "code": "doc.addFileToVFS('cn.ttf', b64); doc.addFont('cn.ttf','cn','normal'); doc.setFont('cn')"
        },
        {
          "title": "html2canvas 组合的注意事项",
          "body": "若用 html2canvas 截图再转 PDF，页面里的跨域图片会污染 canvas。把所有图片改为同源或 data URL。",
          "code": "html2canvas(el, { useCORS: false, backgroundColor: '#fff' })"
        }
      ],
      "pitfalls": [
        "WOFF/WOFF2 不能直接注册，必须是 TTF",
        "字体子集缺字会导出空白字符",
        "未设置 setFont 时中文显示为乱码"
      ],
      "verify": "断网导出 PDF，用阅读器打开确认中文正常且文字可检索。"
    },
    {
      "id": "hlsjs",
      "name": "hls.js / 视频播放",
      "category": "media",
      "package": "hls.js",
      "version": "1.7.4",
      "license": "Apache-2.0",
      "prefetch": true,
      "summary": "HLS 播放，npm 包本地打包；m3u8 与分片必须来自内网流媒体服务。",
      "cdnHosts": [
        "cdn.jsdelivr.net",
        "vjs.zencdn.net"
      ],
      "size": "展开 29.9 MB / 下载包 7.3 MB · 24 个文件",
      "extract": [
        "package/dist/**",
        "package/package.json"
      ],
      "files": [
        "dist/hls.min.js",
        "dist/hls.mjs"
      ],
      "install": "npm i hls.js@1.7.4",
      "snippet": "import Hls from 'hls.js'\n\nconst video = document.querySelector('#video')\nif (Hls.isSupported()) {\n  const hls = new Hls({ enableWorker: true })\n  hls.loadSource('/live/stream.m3u8')\n  hls.attachMedia(video)\n} else if (video.canPlayType('application/vnd.apple.mpegurl')) {\n  video.src = '/live/stream.m3u8'\n}",
      "tutorial": [
        {
          "title": "用 npm 包替换 CDN 播放器",
          "body": "删除 index.html 里 video.js / hls.js 的 CDN script 与 CSS，改为 npm 安装并 import。播放器皮肤的字体与 sprite 也要本地化。",
          "code": "import Hls from 'hls.js'\nimport 'video.js/dist/video-js.css'"
        },
        {
          "title": "指向内网流媒体",
          "body": "m3u8 与 ts/fMP4 分片由内网 Nginx-RTMP、SRS 或点播服务提供，路径用相对地址。分片服务需返回正确 MIME 与 CORS 头。",
          "code": "hls.loadSource('/vod/demo/index.m3u8')"
        },
        {
          "title": "准备不支持 MSE 的兜底",
          "body": "部分内网终端浏览器较旧，检测 Hls.isSupported() 失败时回退到原生 HLS（Safari）或直接播放 mp4。flv.js 场景同理。",
          "code": "video.src = '/vod/demo.mp4' // 兜底"
        },
        {
          "title": "处理 Worker 与销毁",
          "body": "enableWorker 时确认构建产物包含 worker 文件；组件卸载调用 hls.destroy()，避免持续拉流。",
          "code": "onBeforeUnmount(() => hls?.destroy())"
        }
      ],
      "pitfalls": [
        "分片服务缺 CORS 头会导致播放黑屏",
        "旧版 IE/Edge 无 MSE，需要 mp4 兜底",
        "播放器 CSS 内引用的字体与图标常被漏拷"
      ],
      "verify": "断网播放内网 m3u8 与 mp4，画面正常，Network 全部指向内网地址。"
    },
    {
      "id": "cesium",
      "name": "CesiumJS",
      "category": "gis",
      "package": "cesium",
      "version": "1.147.0",
      "license": "Apache-2.0",
      "prefetch": true,
      "summary": "三维地球，默认依赖 ion、在线影像与 Geocoder；离线需整包本地化并替换四个联网模块。",
      "cdnHosts": [
        "api.cesium.com",
        "dev.virtualearth.net",
        "cdn.jsdelivr.net"
      ],
      "size": "展开 21.8 MB / 下载包 8.2 MB · 346 个文件",
      "extract": [
        "package/Build/Cesium/**",
        "package/package.json"
      ],
      "files": [
        "Build/Cesium/Cesium.js",
        "Build/Cesium/Workers/*",
        "Build/Cesium/Assets/*",
        "Build/Cesium/Widgets/*",
        "Build/Cesium/ThirdParty/*"
      ],
      "install": "cp -r vendor/cesium/1.147.0/Build/Cesium public/cesium",
      "snippet": "const viewer = new Cesium.Viewer('cesiumContainer', {\n  baseLayerPicker: false,\n  geocoder: false,\n  animation: false,\n  timeline: false,\n  terrainProvider: new Cesium.EllipsoidTerrainProvider(),\n  baseLayer: Cesium.ImageryLayer.fromProviderAsync(\n    Cesium.TileMapServiceImageryProvider.fromUrl(\n      Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')\n    )\n  )\n})\nCesium.Ion.defaultAccessToken = undefined",
      "tutorial": [
        {
          "title": "整包拷贝 Build/Cesium",
          "body": "Workers、Assets、Widgets、ThirdParty 都会被运行时按需加载，必须整包发布。只拷 Cesium.js 会因为缺少 Worker 与资源文件直接崩溃。",
          "code": "public/cesium/\n├── Cesium.js  ├── Workers/\n├── Assets/    ├── Widgets/   └── ThirdParty/"
        },
        {
          "title": "设置 CESIUM_BASE_URL",
          "body": "Vite 中用 define 注入 CESIUM_BASE_URL 指向本地目录，或用 vite-plugin-cesium 自动拷贝。该变量决定 buildModuleUrl 的解析基准。",
          "code": "export default defineConfig({\n  define: { CESIUM_BASE_URL: JSON.stringify('/cesium/') },\n  optimizeDeps: { exclude: ['cesium'] }\n})"
        },
        {
          "title": "关闭四个在线依赖",
          "body": "baseLayerPicker、geocoder 设为 false，Ion.defaultAccessToken 置 undefined，影像改为内置 NaturalEarthII 或本地 TMS。在线图层预览与地名搜索在内网必然失败。",
          "code": "new Cesium.Viewer(el, { baseLayerPicker: false, geocoder: false })"
        },
        {
          "title": "接入本地影像、地形与模型",
          "body": "影像用 gdal2tiles 切成 TMS/XYZ 目录，地形用 cesium-terrain-builder 生成 quantized-mesh，3D Tiles、glb、PLY 放静态服务。服务端配 CORS 与 .terrain/.glb/.pbf 的 MIME。",
          "code": "new Cesium.UrlTemplateImageryProvider({\n  url: '/tiles/{z}/{x}/{reverseY}.jpg'\n})"
        }
      ],
      "pitfalls": [
        "只拷 Cesium.js 或缺 Workers 目录是最常见的白屏原因",
        "file:// 下加载 3D Tiles 会被当作跨源请求，必须走 HTTP",
        "影像切片方案（Geographic / WebMercator）与 tilingScheme 不一致会导致瓦片错位"
      ],
      "verify": "断网打开三维场景，地球、影像、模型均正常，Network 无 api.cesium.com 与 virtualearth 请求。"
    },
    {
      "id": "threejs",
      "name": "Three.js",
      "category": "gis",
      "package": "three",
      "version": "0.187.0",
      "license": "MIT",
      "prefetch": true,
      "summary": "三维渲染，加载器与 DRACO/KTX2 解码器、贴图、HDR 资源需要本地化。",
      "cdnHosts": [
        "cdn.jsdelivr.net",
        "unpkg.com",
        "www.gstatic.com"
      ],
      "size": "展开 15.5 MB / 下载包 3.6 MB · 517 个文件",
      "extract": [
        "package/build/**",
        "package/examples/jsm/**",
        "package/package.json"
      ],
      "files": [
        "build/three.module.js",
        "examples/jsm/loaders/*",
        "examples/jsm/libs/draco/*",
        "examples/jsm/libs/basis/*"
      ],
      "install": "npm i three@0.187.0",
      "snippet": "import * as THREE from 'three'\nimport { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js'\nimport { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'\n\nconst draco = new DRACOLoader()\ndraco.setDecoderPath('/vendor/three/draco/')\n\nconst loader = new PLYLoader()\nloader.load('/models/pointcloud.ply', geo => {\n  const points = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.02 }))\n  scene.add(points)\n})",
      "tutorial": [
        {
          "title": "从 npm 引入加载器",
          "body": "所有 examples/jsm 下的加载器都从本地包引入，不要用 CDN 的 UMD 版本。PLY 点云是纯静态文件，直接放 public/models/ 即可离线加载。",
          "code": "import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js'"
        },
        {
          "title": "拷贝解码器文件",
          "body": "DRACOLoader、KTX2Loader、GLTFLoader 的某些扩展会运行时加载 wasm/js 解码器。把 examples/jsm/libs/draco/ 与 basis/ 拷到 public，并用 setDecoderPath / setTranscoderPath 指向本地。",
          "code": "draco.setDecoderPath('/vendor/three/draco/')\nktx2.setTranscoderPath('/vendor/three/basis/')"
        },
        {
          "title": "本地化贴图与环境贴图",
          "body": "glTF/glb 内引用的 .bin、贴图 URI、HDR 环境光文件都要同源发布；检查 glb 是否被打包成外链 URI 形式。",
          "code": "new RGBELoader().load('/env/studio.hdr', tex => { scene.environment = tex })"
        },
        {
          "title": "配置 wasm MIME 与 CORS",
          "body": "DRACO/KTX2 的 wasm 需返回 application/wasm，跨源加载需 CORS 头；静态模型服务不要用 file:// 打开。",
          "code": "types { application/wasm wasm; }"
        }
      ],
      "pitfalls": [
        "解码器路径少一层目录会报 404 且错误提示不明确",
        "glTF 外部贴图未随模型一起拷贝会全白",
        "HTTPS 页面加载 HTTP 资源会被混合内容策略拦截"
      ],
      "verify": "断网加载 PLY 点云与一个 draco 压缩的 glb，模型与贴图完整，Network 全部指向本站。"
    },
    {
      "id": "qrcode",
      "name": "二维码 / 本地校验工具",
      "category": "util",
      "package": "qrcode",
      "version": "1.5.4",
      "license": "MIT",
      "prefetch": true,
      "summary": "纯本地计算，作为「无需任何离线改造」的对照项；同时提示验证码与统计类服务的替换。",
      "cdnHosts": [],
      "size": "展开 0.1 MB / 下载包 0.0 MB · 36 个文件",
      "extract": [
        "package/build/**",
        "package/lib/**",
        "package/package.json"
      ],
      "files": [
        "build/qrcode.min.js"
      ],
      "install": "npm i qrcode@1.5.4",
      "snippet": "import QRCode from 'qrcode'\n\nawait QRCode.toCanvas(document.querySelector('#qr'), 'http://intranet/asset/1001', {\n  width: 180,\n  margin: 1,\n  errorCorrectionLevel: 'M'\n})",
      "tutorial": [
        {
          "title": "直接用 npm 包",
          "body": "二维码生成是纯前端计算，没有 CDN 依赖，也不需要资源包。内网私仓安装后即可使用。",
          "code": "import QRCode from 'qrcode'"
        },
        {
          "title": "内容编码与容量",
          "body": "中文内容按 UTF-8 编码，长度较大时提高纠错等级会降低容量，需实测扫码识别率。",
          "code": "QRCode.toDataURL(text, { errorCorrectionLevel: 'M' })"
        },
        {
          "title": "顺带清理在线服务",
          "body": "同类需要一并移除或内网化的还有：行为验证码（极验/云验证码 → 本地图形或滑块）、Sentry / 百度统计、在线客服、Gravatar 头像、CDN 图标。它们不属于组件库，但会让离线验收失败。",
          "code": "// 上线前用 scripts/check-offline.mjs 扫描 dist"
        }
      ],
      "pitfalls": [
        "二维码里写公网地址，扫出来仍然打不开",
        "内容过长时纠错等级与尺寸需同步调整"
      ],
      "verify": "断网生成二维码并扫码，内容正确且页面无外网请求。"
    },
    {
      "id": "baidu-map-offline",
      "name": "离线百度地图完整方案",
      "category": "solution",
      "package": null,
      "localDir": "solutions/baidu-map",
      "version": "1.0.0",
      "license": "按地图服务方授权条款",
      "prefetch": true,
      "summary": "可直接部署的全套离线方案：离线 API 3.0 脚本 + 41 个模块 + Vue 加载器/组件 + WGS84→BD09 坐标转换 + 瓦片服务约定。瓦片数据由内网服务提供，包内不含。",
      "cdnHosts": [
        "api0.map.bdimg.com",
        "gsp0.baidu.com",
        "ss0.bdstatic.com",
        "lbsyun.baidu.com"
      ],
      "size": "展开 1.2 MB / 下载包 0.4 MB · 83 个文件",
      "extract": [],
      "files": [
        "map/js/baidu_map_offline_3.0.js",
        "map/js/AreaRestriction_min.js",
        "map/modules/（41 个）",
        "map/images/（控件与标注图片）",
        "vue/baiduMap.js",
        "vue/BaiduMap.vue",
        "vue/coordTransform.js",
        "config/.env.example",
        "config/vite.proxy.snippet.js",
        "tiles/README.md"
      ],
      "install": "解压 baidu-map-offline-1.0.0.tar.gz → map/ 放到 public/map，vue/ 三个文件放到 src/，config/ 合并到项目配置",
      "snippet": "// 1) 页面里直接用封装好的组件与坐标工具\nimport BaiduMap from \"@/components/BaiduMap/index.vue\"\nimport { wgs84ToBd09, transformRings } from \"@/utils/coordTransform\"\n\n// 2) 业务数据多为 WGS84 / CGCS2000，先转 BD09 再上图\nconst [lng, lat] = wgs84ToBd09(117.0884, 36.2003)\nconst markers = [{ lng, lat, name: \"示例点位\" }]\nconst polygons = [{ name: \"区域 A\", points: transformRings(rings) }]\n\n// 3) 加载器 vue/baiduMap.js 会注入 window.mapConfig 并按序加载离线脚本\n//    tiles_dir 由 VITE_APP_MAP_TILES_URL 配置，默认同域 /map-tiles\n// <BaiduMap :center=\"[lng, lat]\" :zoom=\"12\" :markers=\"markers\" :polygons=\"polygons\" />",
      "tutorial": [
        {
          "title": "放置静态资源",
          "body": "把包内 map/ 整个目录拷到业务项目的 public/map/，最终路径必须是 public/map/js/baidu_map_offline_3.0.js。离线 API 是老式全局脚本，不能 import、不能被 Vite 预构建转译，必须由加载器用 script 标签执行。若应用部署在子路径（如 /admin/），mapConfig.home 要同步改成 /admin/map/。",
          "code": "public/\n└── map/\n    ├── js/baidu_map_offline_3.0.js\n    ├── js/AreaRestriction_min.js\n    ├── modules/   (41 个)\n    └── images/"
        },
        {
          "title": "放置 Vue 代码",
          "body": "把 vue/ 下三个文件放到 src/utils/ 与 src/components/BaiduMap/。BaiduMap.vue 内使用 @/utils/baiduMap 别名，项目别名不同时改这一行 import。组件支持 center/zoom/markers/polygons 等 props，抛出 ready、map-click、marker-click、polygon-click 事件，并暴露 getMap、setCenter、fitToPolygons、setBounds 等方法。",
          "code": "cp vue/baiduMap.js        src/utils/baiduMap.js\ncp vue/coordTransform.js  src/utils/coordTransform.js\ncp vue/BaiduMap.vue       src/components/BaiduMap/index.vue"
        },
        {
          "title": "配置瓦片服务地址",
          "body": "瓦片不在包内，由内网独立服务提供，拼接规则为 {tiles_dir}/{z}/{x}/{y}{imgext}。推荐用同域相对路径 /map-tiles 加反向代理，避免跨域、硬编码 IP 与混合内容；也可用 .env 的 VITE_APP_MAP_TILES_URL 直接指向内网服务。包内 config/ 提供了 .env 示例与 Vite 代理片段，tiles/README.md 提供 Nginx 转发配置。",
          "code": "# .env.production\nVITE_APP_MAP_TILES_URL = '/map-tiles'\n\n# vite.config.js（开发期）\n'/map-tiles': { target: 'http://瓦片服务:端口', changeOrigin: true,\n                 rewrite: p => p.replace(/^\\/map-tiles/, '/map') }"
        },
        {
          "title": "统一坐标系到 BD09",
          "body": "离线百度底图为 BD09，而业务围栏 GeoJSON、GPS 采集点通常是 WGS84 / CGCS2000（厘米级差异可按 WGS84 处理）。不转换会整体偏移约 500m~1km。离线环境百度官方在线 geoconv 不可用，必须用包内 coordTransform.js 本地换算。该近似算法偏差约 1~2 米，满足展示，不可用于测绘确权。",
          "code": "import { wgs84ToBd09, transformRings } from \"@/utils/coordTransform\"\nconst [lng, lat] = wgs84ToBd09(117.0884, 36.2003)\nconst bdRings = transformRings(geojsonRings)"
        },
        {
          "title": "核对配置源与功能边界",
          "body": "window.mapConfig 由 vue/baiduMap.js 注入，是唯一生效的配置源；map/js/map-config.js 是历史遗留文件，里面仍写着 .png 与 api0.map.bdimg.com，改它不生效。自定义地图样式、地名检索、地理编码、全景、卫星图层在离线环境仍会请求公网，属于不可用功能，业务侧要禁用入口。",
          "code": "window.mapConfig = {\n  imgext: \".jpg\", tiles_dir: \"/map-tiles\",\n  tiles_hybrid: \"\", tiles_self: \"\", home: \"/map/\"\n}"
        },
        {
          "title": "断网验收",
          "body": "断网或断 DNS 后刷新地图页，逐个过滤脚本内残留的在线域名；缩放拖拽、标注点击、多边形点击、视野适配均应正常。瓦片 404 时按 imgext 后缀、目录层级、home 前缀三项排查。完整部署说明见包内 README.md。",
          "code": "过滤：bdimg.com / baidu.com / bdstatic.com / lbsyun.baidu.com\n期望：0 条请求，控制台无 BMap 未定义、无 404"
        }
      ],
      "pitfalls": [
        "map/js/map-config.js 是遗留文件，运行时被 window.mapConfig 覆盖，改它不生效",
        "离线 API 不能用 import / 不能被 Vite 预构建，必须 script 标签顺序加载（API 在 AreaRestriction 之前）",
        "WGS84 未转 BD09 直接上图，会整体偏移约 500m~1km；境外坐标工具会原样返回",
        "部署在子路径时 home 未同步修改，会导致 modules 与 images 全部 404",
        "自定义样式、检索、地理编码、全景、卫星图层仍指向公网，离线环境会发无效请求",
        "瓦片 404 最常见原因：imgext 与实际后缀不符（jpg/png）、{z}/{x}/{y} 层级不一致、HTTPS 页面引用 HTTP 瓦片",
        "方案默认保留版权控件显示，请按与地图服务方的授权约定决定是否调整"
      ],
      "verify": "断网刷新地图页，Network 过滤 bdimg.com / baidu.com / bdstatic.com 为 0 条；瓦片全部 200；缩放、标注与多边形点击正常；wgs84ToBd09 转换后的点位与底图道路对齐。"
    }
  ]
};
