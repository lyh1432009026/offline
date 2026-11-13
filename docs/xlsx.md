# SheetJS / ExcelJS — 内网离线使用教程

> 所属分类：文档预览　|　版本：0.18.5　|　许可：Apache-2.0　|　资源体积：展开 5.1 MB / 下载包 1.6 MB · 14 个文件

Excel 解析与导出，纯本地计算；注意 npm 上的 xlsx 版本已停更。

## 一、离线风险点

默认会请求的公网域名：`cdn.sheetjs.com`

必须随包发布的文件：

- `dist/xlsx.full.min.js`

## 二、接入步骤

安装 / 部署：

```bash
npm i xlsx@0.18.5 或 exceljs
```

### 1. 从内网私仓安装

npm registry 上的 xlsx 停留在 0.18.5，官方新版本改由自家地址分发。内网统一用私仓锁定的版本，不要引 CDN 脚本。

```
npm i xlsx@0.18.5
```

### 2. 评估安全与体积

0.18.5 存在已公开的安全公告，处理不可信上传文件前需评估；新项目可改用 exceljs（仅支持 xlsx，API 更现代）。大文件解析放进 Web Worker。

```
import ExcelJS from 'exceljs'
const wb = new ExcelJS.Workbook()
await wb.xlsx.load(buf)
```

### 3. 前端导出与中文编码

导出时确保文件流为二进制，中文表头用 UTF-8；若后端生成，直接返回 Content-Disposition 附件更稳妥。

```
XLSX.writeFile(wb, '报表.xlsx', { bookType: 'xlsx' })
```

## 三、推荐配置

```js
import * as XLSX from 'xlsx'

const wb = XLSX.read(arrayBuffer, { type: 'array' })
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])

const out = XLSX.utils.json_to_sheet(rows)
XLSX.writeFile({ Sheets: { Sheet1: out }, SheetNames: ['Sheet1'] }, 'report.xlsx')
```

## 四、常见坑

- 解析大文件阻塞主线程，建议 Worker
- xls（BIFF）与 xlsx 走不同解析路径，需实测
- 不要从 cdn.sheetjs.com 引脚本

## 五、断网验收

断网导入并导出一份含中文与日期的表格，数据一致、Network 无外网请求。

## 六、资源包

- 下载：`vendor/xlsx/xlsx-0.18.5.tar.gz`（由 `node scripts/build-vendor.mjs --only=xlsx` 生成）
- 来源：`xlsx@0.18.5`，npm 镜像 https://registry.npmmirror.com

---

返回 [教程索引](./INDEX.md)　|　[内网门户](../index.html)　|　清单更新日期 2026-11-12
