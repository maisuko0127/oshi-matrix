# 我推一览编辑器 / OSHI MATRIX

一个纯静态的「我推」表格编辑器。可编辑标题、发色 × 瞳色表头、角色图片与名字/IP，支持本地存档、二维码快照分享和 PNG 导出。

## 使用

直接打开 `index.html`，或部署到任意静态网站托管。无需构建、无需后端。

## GitHub Pages

仓库根目录即为站点根目录。在仓库 **Settings → Pages** 中选择：

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/ (root)`

保存后等待 Pages 构建完成即可。

## 文件

- `index.html` — 页面结构
- `style.css` — 样式
- `app.js` — 编辑、存档、二维码、导出逻辑
- `qrcode.js` — 二维码生成
- `jsQR.js` — 二维码识别
- `lz-string.min.js` — 状态压缩
- `fonts/RHR-CN-Heavy.woff2` — 中文字体

## 说明

- 数据保存在浏览器本地；小红书小工具版使用平台 Storage。
- 二维码是离线快照，只包含文字、配色和版面，不包含上传图片，也不是实时协作。
- 本地存档最多 5 个。
