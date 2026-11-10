# SAK 工作室 · 站点说明

纯静态站，零框架、零外链依赖。5 个页面 + 1 套动效系统。

- **线上**：https://sak7777.github.io/default-workspace/
- **本地**：双击 `start.cmd`（自动开浏览器），或直接双击 `index.html`
- **联系**：318718579@qq.com · 中国上海

## 页面

| 文件 | 内容 |
|---|---|
| `index.html` | 首页 —— 全屏首图、能力跑马灯、精选作品、服务、数据、CTA |
| `work.html` | 作品列表 —— 6 个案例格子 |
| `case-nod.html` | 案例详情 —— 版式复刻，年份 2026 |
| `about.html` | 关于 —— 介绍、数据、四步流程、能力矩阵 |
| `contact.html` | 联系 —— 邮箱、表单（含邮件兜底）、信息栏 |

---

## 一、动效清单

### 1. 首屏加载
| 动效 | 实现 | 时长 / 缓动 |
|---|---|---|
| 标题逐行揭幕 | `[data-split]` 按 `<br>` 分行，逐行淡入上移 | 900ms · `cubic-bezier(.16,1,.3,1)` |
| 首图缓推（Ken Burns） | `@keyframes kenburns`，scale 1.06→1 | 9s 一次性 |
| 顶部导航入场 | `navIn` 位移淡入 | 900ms |
| Kicker 字符解码 | `[data-decrypt]` 随机字符收敛 | 34ms/帧 |
| 网格线淡入 | `body.ready` 触发 opacity 0→1 | 1200ms（延迟 200ms） |

### 2. 滚动显现
| 动效 | 实现 | 时长 / 缓动 |
|---|---|---|
| 区块进场 | `.rv` + IntersectionObserver（`rootMargin:-6% 0 -10%`，阈值 .05） | 1000ms |
| 分组错峰 | `.works / .svc / .steps / .stats` 子元素每级 +60ms | 阶梯 ≤300ms |
| 滚动进度条 | 顶部 2px，`scaleX` 跟随滚动 | rAF 实时 |
| 导航收缩 | 滚动 >40px 时 `.is-scrolled` | 320ms |

### 3. 导航与按钮
| 动效 | 实现 | 时长 / 缓动 |
|---|---|---|
| 菜单开合 | 面板淡入 + 内容 `translateY(18px)`；5 行错峰 40ms | 320ms |
| 汉堡旋转 | `#menuBtn svg` rotate 90°（`aria-expanded` 驱动） | 240ms · spring |
| 字标下划线 | `::after` `scaleX 0→1` | 240ms |
| 按钮指针光晕 | `--mx/--my` 跟随指针的径向渐变 | 240ms |
| 按钮点击涟漪 | 动态插入 `.ripple` span | 420ms |
| 按钮按压 | `:active` `scale(.97)` | 150ms |
| 图标位移 | hover 时箭头 `translateX(4px)` | 240ms |

### 4. 卡片与图片
| 动效 | 实现 | 时长 / 缓动 |
|---|---|---|
| 作品卡 3D 倾斜 | 指针映射 ±3°，`perspective(900px)` | rAF 跟随 |
| 图片缩放 | hover `scale(1.04)` | 420ms |
| 光泽扫过 | `::after` 渐变斜扫 | 320ms |
| 标题位移 + 变色 | `.work__title` `translateY(-3px)` | 240ms |
| 长图微抬 + 阴影 | `.grid__item:hover` | 320ms |
| 服务卡上浮 | `.svc__item:hover` `translateY(-3px)` | 240ms |
| 数字滚动 | `[data-count]` 缓动计数 | 1600ms |

### 5. 表单反馈
| 动效 | 实现 | 时长 / 缓动 |
|---|---|---|
| 字段焦点 | `border-color` + 外发光 | 240ms |
| 校验失败 | 边框变红 + `shake` 抖动 | 320ms |
| 提交成功 | `.form-ok` 淡入上移，附 `mailto:` 兜底链接 | 320ms |
| 输入纠错 | 重新输入即清除红框 | 即时 |

### 6. 移动端（不缺失、只降级）
| 场景 | 桌面 | 移动 |
|---|---|---|
| 按钮 | hover 上浮 + 光晕 | `:active scale(.96)` |
| 作品卡 | 3D 倾斜 | `:active scale(.985)`，去掉光泽 |
| 服务卡 | hover 上浮 | `:active` 背景变化 |
| 菜单行 | hover 右移 | `:active` 右移 |

---

## 二、动效一致性规范

**时长四档**（CSS 变量，全站只用这四个）

```css
--dur-fast:150ms;    /* 悬停、按下、焦点 */
--dur-base:240ms;    /* 导航、卡片、表单 */
--dur-slow:320ms;    /* 区块、菜单 */
--dur-slower:420ms;  /* 首屏、涟漪 */
```

**缓动三条**

```css
--ease-out:cubic-bezier(.16,1,.3,1);      /* 进场、位移（默认） */
--ease-in-out:cubic-bezier(.65,0,.35,1);  /* 双向状态切换 */
--ease-spring:cubic-bezier(.34,1.56,.64,1);/* 弹性、图标旋转 */
```

**层级**

```css
--z-content:1; --z-overlay:5; --z-nav:100; --z-noise:9998; --z-cursor:9999;
```

**触发阈值**：滚动显现统一 `rootMargin: -6% 0px -10% 0px` + `threshold: 0.05`，只触发一次（`unobserve`）。

**复用规则**：新增动效一律挂到 `.btn` / `.work` / `.svc__item` / `.rv` 这些既有类上，或加 `data-*` 钩子（`data-magnet` / `data-split` / `data-decrypt` / `data-count` / `data-tilt`），**不在页面内写动画样式**。

---

## 三、资源来源与许可

> **说明**：本站没有嵌入任何第三方库或模板源码，全部为原生重写（CSS 变量 + IntersectionObserver + rAF）。
> 原因见「性能约束」——GSAP 约 70KB、Lottie 运行集约 250KB，都会突破「不增加包体」的要求。
> 下面是每个动效所参考的来源与其许可。

| 动效 | 参考来源 | 许可 | 使用方式 |
|---|---|---|---|
| 磁吸按钮 | GSAP `quickTo` 官方示例 · https://gsap.com/docs/v3/GSAP/gsap.quickTo() | GSAP 现为免费（Webflow 收购后全插件开源） | 参考思路，用 rAF 原生实现 |
| 逐行文本揭幕 | React Bits `SplitText` · https://www.reactbits.dev/text-animations/split-text | MIT + Commons Clause | 参考分行动画，原生重写 |
| 字符解码 | React Bits `DecryptedText` | MIT + Commons Clause | 同上 |
| 无缝跑马灯 | React Bits `LogoLoop` + Codrops marquee 技法 · https://tympanus.net/codrops/ | MIT + Commons Clause / Codrops demo 可自由使用（标注来源） | 内容克隆 50% 位移，原生实现 |
| 3D 倾斜卡片 | vanilla-tilt · https://github.com/micku7zu/vanilla-tilt.js | MIT | 参考指针映射，原生实现 |
| 点击涟漪 | Material Design 涟漪规范 | 规范（非代码） | 原生实现 |
| 滚动显现 | MDN IntersectionObserver 文档 | 文档 | 原生实现 |
| 缓动曲线 | easings.net | 免费 | 直接取曲线数值 |
| 滚动进度条 | 通用模式 | — | 原生实现 |
| Ken Burns | 摄影术语，通用 CSS 技法 | — | 原生实现 |
| 字体 | 系统字体栈（Segoe UI / 苹方 / 微软雅黑） | 系统字体 | 无外链 |

**未引入但评估过的**：Anime.js（MIT，约 17KB）、Lottie Web（MIT，约 250KB）、GSAP 全量（免费，约 70KB）。均因体积或与现有 CSS 动效重复而放弃。

---

## 四、性能与可访问性

**性能**
- 只动 `transform` / `opacity`，不触发布局
- 滚动/指针事件统一 `requestAnimationFrame` 节流，单次一帧
- 事件监听全部 `{ passive: true }`
- 零 JS 依赖，站点总计 CSS 32KB + JS 14KB（未压缩）
- 图片 WebP（首屏 108KB），首屏无阻塞脚本（`site.js` 置于 `</body>` 前）

**可访问性**
- `prefers-reduced-motion: reduce` → 全部动效时长压到 0.001ms，静态呈现
- **紧急开关**：任何页面加 `?nomotion=1` 立刻静止（不改文件）
- `:focus-visible` 统一焦点环（2px 品牌色，offset 3px）
- 对比度：正文 / 标签 token 提升至 AA（`--muted` .72、`--faint` .58）
- 点按区：页脚链接补 `padding: 8px 0`，达到 24px 以上
- 装饰层（噪点、网格、光标、进度条）全部 `aria-hidden` 或 `pointer-events:none`
- 表单 `aria-live="polite"` 播报提交结果

---

## 五、验收结果

### 与原站对比

| 维度 | 原站（nudot work_nod） | 本站 | 结论 |
|---|---|---|---|
| 动效丰富度 | 页面转场、自定义光标、噪点、网格、标题混合模式 | 保留全部 + 新增 18 项（进度条、涟漪、倾斜、菜单错峰、表单反馈…） | **提升** |
| 交互反馈完整性 | hover 有反馈；按下 / 点击 / 表单无反馈 | 悬停 + 按下 + 点击 + 提交 + 校验失败全覆盖 | **提升** |
| 视觉一致性 | 各页样式分散 | 统一 token（4 时长 / 3 缓动 / 5 层级），复用类 | **提升** |
| 移动端适配 | 桌面优先，三栏在窄屏溢出 | 3 条断点规则，实测 `overflow=no`、无破图 | **提升** |
| 加载性能 | 多外链字体 + 图片 | 零外链字体、零 JS 依赖、WebP | **提升** |
| 可访问性 | 部分支持 reduced-motion | reduced-motion + 焦点环 + AA 对比 + 点按区 | **提升** |

### 实测记录

| 检查 | 结果 |
|---|---|
| 本地资源引用 | 19 条全部命中，0 缺失 |
| 运行时错误 | 5 页 `errors=0` |
| 图片加载 | 首页 `imgs=5/5`，全部 200 |
| 设计审计（contact） | 高优先问题 0（对比度、点按区已清零） |
| 移动端 | 520px 视口 `overflow=no`、`brokenImgs=0` |
| 静态降级 | `?nomotion=1` 与 `prefers-reduced-motion` 均完整可读 |
| 线上 | 5 页 + CSS/JS/图片/视频全部 200，MIME 正确 |

---

## 六、回滚说明

**整站回滚到上一个版本**

```bash
git revert HEAD --no-edit && git push origin master
```

**只回滚某个文件**（例如动效出问题，先退回 CSS）

```bash
git log --oneline -5                       # 找到目标提交
git checkout <commit> -- sak-studio/assets/site.css
git commit -m "revert: 回滚动效样式"
git push origin master
```

**紧急关掉动效（不改代码）**

- 页面 URL 后加 `?nomotion=1`，例如：
  `https://sak7777.github.io/default-workspace/sak-studio/?nomotion=1`
- 全站瞬时静止，内容完整可读

**关闭对外发布**

```bash
gh api -X DELETE repos/SAK7777/default-workspace/pages
```

**恢复仓库私有**

```bash
gh api -X PATCH repos/SAK7777/default-workspace -F private=true
```

---

## 七、改哪里

- 文案：直接改 HTML 文字
- 品牌名：5 页各 3 处（`<title>`、`.ns-logo`、`.footer-brand-title`）
- 联系邮箱：`318718579@qq.com`，`mailto:` 链接共 24 处
- 所在地：`contact.html` 的 `.info-list` → `中国上海`
- 年份：`<span data-year>` 自动取当前年；案例页标题写死 `2026`
- 动效参数：`assets/site.css` 顶部 `:root` 的 `--dur-*` / `--ease-*`
