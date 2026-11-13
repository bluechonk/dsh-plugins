---
name: visualize
description: "把 HTML 页面作为对话内可交互可视化渲染（界面原型、图表、模拟器、对比、交互 demo）。当用户想在对话里看到或探索一个页面/界面，而不只是听文字描述时使用。"
---

# 对话内可视化（visualize）

把一个真正能点、能填、能跑的页面直接渲染在回复里，而不是只描述它。

## 什么时候用

- 用户要在对话里**预览、探索或对比**一个界面/页面/交互内容：「做个原型看看」「这个方案长什么样」「帮我对比两个设计」「做个能调的图表」。
- 静态结构用 Mermaid、静态表格用 Markdown 表格就够了——那些情况**不要**做可视化。
- 独立交付的网页/项目改动走正常文件流程，不要用本技能。

## 怎么做

1. **写文件**：把完整、自包含的 HTML 页面写到当前工作区的

   ```
   <workspace>/.dsh/visualizations/<name>.html
   ```

   `<name>` 用简洁的小写连字符（如 `pricing-compare.html`）。页面必须是完整 HTML（`<!doctype html>` + `<html>`），因为插件会把它直接渲染成 iframe。

2. **在回复里放一个围栏**，指向该文件：

   ````text
   ```visualize
   {"path":"C:/path/to/<workspace>/.dsh/visualizations/<name>.html","title":"可选标题","height":420}
   ```
   ````

   - 围栏体可以是 **JSON**（支持 `title` / `height`），也可以**直接就是路径**（一行，推荐用正斜杠，省得转义）：

     ````text
     ```visualize
     C:/path/to/<workspace>/.dsh/visualizations/<name>.html
     ```
     ````

   - `path` 必填，必须是**绝对路径**，且落在当前工作区之内；
   - `title` 可选，显示在卡片标题条；
   - `height` 可选，卡片高度（px，缺省 420）；
   - 一条回复可以放多个围栏，按出现顺序追加渲染。

3. 围栏放在回复**末尾**（当前版本的可视化卡片追加在正文之后）。

## 页面约束（宿主沙箱，违反会被拦）

- 页面运行在 `sandbox="allow-scripts"` 的 iframe 里：**没有同源权限**，读不到宿主数据。
- 响应 CSP 只放行内联脚本/样式与常用 CDN 的脚本、字体和图片：
  `cdnjs.cloudflare.com`、`cdn.jsdelivr.net`、`unpkg.com`、`esm.sh`、`fonts.googleapis.com`、`fonts.gstatic.com`。
- **不要**用 `fetch` / `XMLHttpRequest` / WebSocket——`connect-src` 被禁，请求发不出去。
- 页面体积控制在 1MB 以内；单文件自包含优先。
- 只用主题变量（`--background` / `--foreground` / `--card` / `--primary` / `--border` / `--muted` 等）或 `light-dark()`，让深浅色都成立；不要写死某一档配色。

## 写法要点

- 首屏就要有意义：默认状态直接可用，不要依赖用户先点某个按钮。
- 控件用原生 `button` / `input` / `select`；交互状态本地处理，不需要回传模型。
- 画布/图表按容器实际宽度绘制，窄宽度要能重排或降级。
- 不要写「点击这里」这类说明文字；需要解释放在围栏外的正文里，简短一句即可。
- 不要宣布这个技能、围栏、文件路径机制或实现细节。
