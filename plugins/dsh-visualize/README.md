# dsh-visualize

**中文** | [English](README.en.md)

DeepSeek Harness 插件：让模型把 HTML 页面作为**对话内可交互可视化**渲染出来——模型把页面写成文件、在回复里放一个 `visualize` 围栏，插件用沙箱 iframe 内联渲染。

## 它解决什么

DSH 的回复默认只有 Markdown。想让模型「做个原型看看」「把这组数据画成能交互的图」「对比两个界面」，通常只能贴代码块或者让用户自己去开文件。本插件给了一条对话内的渲染通道：

1. 模型把完整、自包含的 HTML 页面写到 `<workspace>/.dsh/visualizations/<name>.html`；
2. 在回复里放一个围栏（绝对路径）：

   ````text
   ```visualize
   {"path":"/abs/path/to/<workspace>/.dsh/visualizations/<name>.html","title":"可选标题","height":420}
   ```
   ````

   围栏体也可以**直接就是路径**（一行，推荐正斜杠，省得转义）：

   ````text
   ```visualize
   C:/path/to/<workspace>/.dsh/visualizations/<name>.html
   ```
   ````

3. 插件把围栏换成沙箱 iframe，渲染在回复正文之后。

一条回复可以放多个围栏，按出现顺序追加渲染。

## 插件标识

| 项 | 值 |
|---|---|
| npm 包名 | `@bluechonk/dsh-visualize` |
| loader 行 id | `@bluechonk/dsh-visualize` |
| client 模块 id | `@bluechonk/dsh-visualize`（必须与包名逐字一致） |
| 宿主路由 | `GET /dsh-visualize/file?path=<绝对路径>` |

## 界面

| 区域 | 说明 |
|---|---|
| 可视化卡片 | 标题条（`title`，缺省用路径；`title` 属性带完整路径）+「新窗口打开」链接 + 沙箱 iframe |
| 高度 | 围栏里的 `height`（px），缺省 420 |
| 加载态 | 先探一次路由：就绪才挂 iframe；失败显示「可视化加载失败」，不留白框 |
| 多卡片 | 一条回复里的多个围栏按顺序追加在正文之后 |

## 数据通道

宿主半在 `ctx.webServer` 上注册同源路由（带回环 + 同源守卫）：

| 方法 | 路径 | 用途 |
|---|---|---|
| GET | `/dsh-visualize/file?path=<绝对路径>` | 按白名单校验后返回 HTML 文件内容 |
| HEAD | 同上 | 只回头部，供前端预探 |

## 安全与边界

- 路由只接受本机同源请求（回环地址 + `sec-fetch-site` / `origin` 校验）。
- 路径必须是**绝对路径**，且真实路径（跟随符号链接后）落在两类白名单内：插件自有目录 `<dshHome>/visualizations`、任意已登记工作区。越界、相对路径、目录、超过 1MB 一律 404。
- iframe 用 `sandbox="allow-scripts"`：没有同源权限，页面脚本读不到宿主、发不出同源请求，也开不了弹窗/表单/顶层导航。
- 响应带 CSP（`default-src 'none'`，只放行内联脚本样式与常用 CDN 的脚本/字体/图片）、`X-Content-Type-Options: nosniff`、`Cache-Control: no-store`。
- 插件自身不写任何持久化数据，不联网、不上传。

## 技能

包内带了 `skills/visualize/SKILL.md`，教模型什么时候用、怎么写页面、围栏怎么放。DSH 的技能发现只认技能根目录（`~/.dsh/skills`、`~/.agents/skills`、工作区 `.dsh/skills` / `.agents/skills`），所以装完插件要把这个技能放进其中一个根：

```bash
# 任选一个技能根，把 visualize 技能放进去
mkdir -p ~/.dsh/skills
cp -r plugins/dsh-visualize/skills/visualize ~/.dsh/skills/visualize
```

## 安装、更新、卸载

本插件是 dsh-plugins 仓库的子目录 `plugins/dsh-visualize`，安装方式与仓库内其他插件一致（市场索引 / `plugin_manager install_bundle` / 本地目录），详见仓库根 [README](../README.md)。

```bash
# 卸载
plugin_manager remove_bundle --target "@bluechonk/dsh-visualize"
```

## 开发

```bash
npm install           # 在仓库根目录，装 esbuild（仅构建需要）
npm run build         # 在仓库根目录，把所有 src/client/ 打包成各自的 client/client.js
npm test              # node:test 单测（27 项：围栏解析 / 路径白名单 / 文件路由 / client 装配与渲染）
npm run check         # 语法检查（lib / client / src）
```

**为什么 client 半有源码和产物两份**：DSH 的 client 产物是被 `__ModuleLoader__` 的 `factory(require)` 包裹的单文件（官方约定），源码按职责拆在 `src/client/`，构建期用 esbuild 打包。装插件的人只需要产物，esbuild 是仓库根的 devDependency。

## 实现要点

- **遮蔽而非重写**：`conversation.chat.node` 是 keyed / session 作用域的聊天节点槽，key = 节点 kind。官方 `assistant-step` 条目渲染助手回复；本插件用同一 key、`priority: -1` 遮蔽它。
- **没有 viz 围栏时，把整个 props 原样交给官方组件**——行为与原生完全一致，不复制官方渲染逻辑。
- **有围栏时**：把围栏从文本块里剥掉再交给官方组件，随后追加沙箱 iframe。官方条目仍留在 `slots.entries` 里，插件捕获它的 `component` 与 `inject` 并代理注入，保证官方组件拿到的 props 不变。
- 风险因此被限制在「确实写了 viz 围栏」的回复上。

## 仓库

- 所在仓库：<https://github.com/bluechonk/dsh-plugins>，本插件位于 `plugins/dsh-visualize`。
- 设计与验证细节见 [docs/DESIGN-AND-VERIFICATION.md](docs/DESIGN-AND-VERIFICATION.md)，版本变更见 [CHANGELOG.md](CHANGELOG.md)。

## 致谢与许可

MIT License，见 [LICENSE](LICENSE)。

实现参考了社区插件 [dsh-genui](https://github.com/omdsh-dev/dsh-genui)（MIT）的「遮蔽 `assistant-step` 聊天节点」思路——同样的宿主扩展点与官方条目捕获方式；本插件的代码、围栏语法与渲染策略均为独立实现。
