# SAK 工作室 · 站点说明

纯静态站，无构建、无框架、无外链字体。

## 怎么打开

1. **双击 `start.cmd`** —— 起本地服务并自动开浏览器（端口被占会自动换 5174、5175…）
2. 或者直接 **双击 `index.html`** —— 走 file:// 也能正常显示图片和动效
3. 命令行：`node server.js`

## 页面

| 文件 | 内容 |
|---|---|
| `index.html` | 首页 —— 全屏首图、能力跑马灯、精选作品、服务、数据、CTA |
| `work.html` | 作品列表 —— 6 个案例格子，悬停放大 |
| `case-nod.html` | 案例详情 —— 原版式复刻，年份 2026 |
| `about.html` | 关于 —— 介绍、数据、四步流程、能力 |
| `contact.html` | 联系 —— 邮箱、表单（演示版无后端）、信息栏 |

## 资源

- `assets/site.css` — 全站样式（约 21KB）
- `assets/site.js` — 全站交互（约 7KB）
- `images/` — 11 张图 + 1 段视频

## 改哪里

- 文案：直接改 HTML 里的文字
- 品牌名：5 个页面各出现 3 处（`<title>`、导航 `.ns-logo`、页脚 `.footer-brand-title`）
- 邮箱：`mailto:hello@sak.studio`，共 5 处
- 年份：多数页面用 `<span data-year>` 自动取当前年；案例页标题里是写死的 `2026`

## 动效清单（改写自 React Bits / Eldora，原生实现）

| 动效 | 来源 | 用在哪 |
|---|---|---|
| SplitText 逐行揭幕 | React Bits `SplitText` | 各页大标题 `[data-split]` |
| Magnet 磁吸 | React Bits `Magnet` | 所有按钮 `[data-magnet]` |
| DecryptedText 字符解码 | React Bits `DecryptedText` | 首屏 kicker、邮箱 `[data-decrypt]` |
| LogoLoop 无缝跑马灯 | React Bits `LogoLoop` | 首页 / 作品页 `.loop` |
| ScrollReveal 滚动进场 | React Bits `AnimatedContent` | `.rv` |
| 数字滚动 | — | 数据区 `[data-count]` |
| 双光标 + 网格线 + 噪点 | 原站语言 | 全站 |

`prefers-reduced-motion` 下全部降级为静态，不做动画。
