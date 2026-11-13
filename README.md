# dsh-plugins

DeepSeek Harness（DSH）插件市场。一份 `market-index.json` 加 `plugins/` 下的多个插件，在 DSH 里粘贴**一条**索引地址即可浏览并一键安装全部。

## 索引地址

```
https://raw.githubusercontent.com/bluechonk/dsh-plugins/main/market-index.json
```

> DSH 的 `plugin-market` 服务对索引请求使用 `redirect: "error"`（源码实证），**拒绝任何重定向**。索引源必须指向 JSON 文件本身，填仓库首页（`github.com/bluechonk/dsh-plugins`）会拿到 HTML，报 `$.format must be 1`。

## 在 DSH 里添加

1. 侧栏 → **插件** → **发现** 标签页（需先启用 `@deepseek-ai/dsh-experimental-plugin-market-bundle`）
2. 索引源输入框粘贴上面的地址 → 添加
3. 浏览、点「安装」

## 仓库结构

```text
market-index.json              插件市场索引（format 1，由脚本生成，不要手改）
plugins/
  dsh-skills-manager/          侧边栏「技能」面板：管理全局/用户/工作区各级 skills
  dsh-usage-stats/             使用统计面板：模型用量、token、费用
  dsh-viz/                     对话内可视化：模型写的 HTML 页面以沙箱 iframe 渲染
scripts/
  sync-index.mjs               从 plugins/ 生成 market-index.json
  check-all.mjs                逐个跑各插件的语法检查
  test-all.mjs                 逐个跑各插件的单测
  build-client.mjs             把所有 src/client/ 打包成各自的 client/client.js
.githooks/pre-push             本地推送前门禁（与 CI 等价）
```

## 安装原理

索引里每个插件指向本仓库的子目录，安装时由 DSH 解析为：

```
git+https://github.com/bluechonk/dsh-plugins.git#<commit>&path:/plugins/<name>
```

即锁定到某个 commit 的指定子目录，不复制文件、不打包产物。

## 开发

```sh
npm run check          # 各插件语法检查
npm test               # 各插件单测
npm run index          # 重新生成 market-index.json（发版时用）
npm run index:check    # 校验索引有效：钉住的提交存在且为 HEAD 祖先、版本与描述一致
npm run hooks:install  # 启用 .githooks（每个 clone 执行一次）
```

**索引是发布产物，不是每次改动都更新**。索引钉住一个 commit，而 squash 合并的提交本身既改 `plugins/` 又改索引——索引要指向自己，自指无解。所以：

- 日常改插件代码或文档：`npm test` → 开分支提 PR，**不碰 `market-index.json`**，CI 不会因 squash 变红。
- 发版（bump `plugins/*/package.json` 的版本号）后：`npm run index` → 单独提交索引，把指针指向发布提交。漏更新会被 `index:check` 挡住（版本对不上）。

`index:check` 校验三件事：钉住的 commit 存在、是当前 HEAD 的祖先、索引声明的版本与描述和当前 `package.json` 一致。

## 分支与合并

`main` 受服务端分支保护，不能直推，只能通过 PR 合入：

- 直推 `main`（含强推、删除）会被服务端拒绝，本地 `.githooks/pre-push` 也会在联网前拦下。
- 合并只允许 Squash Merge，`main` 保持线性历史。
- CI 的 `test (22.x)`、`test (24.x)` 必须通过才能合并。
- 个人仓库没有第二人可审批，因此不设强制 approve 数；PR 流程、CI 状态与 squash 约束才是硬门禁。

未启用钩子时，`pre-push` 的本地检查不会执行，只有服务端保护兜底。启用方式见上面的 `npm run hooks:install`。

## 致谢与许可

**dsh-skills-manager**

- 目录扫描、frontmatter 解析与整体形态参考 [pengxiaozi/dsh-plugins](https://github.com/pengxiaozi/dsh-plugins) 的 `dsh-skill-panel`（MIT）。该插件的 lib 与 client 代码为重写，实测与参考项目几乎无相同行，仅形态沿用。

**dsh-usage-stats**

- 看板实现衍生自 [axuan-1314/dsh-usage-stats](https://github.com/axuan-1314/dsh-usage-stats)（MIT）：核心逻辑 `lib/aggregate.js`、`lib/store.js`、`lib/fold.js`、`lib/index.js` 与其有 64%–97% 相同行，故沿用其原始版权声明。
- 早期版本源自 [Make0209/dsh-usage-stats](https://github.com/Make0209/dsh-usage-stats)（MIT），本插件重做了看板（`lib/client.js` 仅约 38% 相同）。
- 界面形态参考 [zai-org/ZCode](https://github.com/zai-org/ZCode)（Apache-2.0）的「使用统计」面板设计，配色取其 CSS 变量真值，不含其代码。
- 采集与折叠语义对齐官方 `@deepseek-ai/dsh-token-meter` 的 `tokenUsage` 投影，不含其代码。

**dsh-viz**

- 「遮蔽 `assistant-step` 聊天节点以拦截自定义围栏」的思路来自社区插件 [dsh-genui](https://github.com/omdsh-dev/dsh-genui)（MIT）：同一宿主扩展点（`conversation.chat.node` 的 keyed / session 槽）与官方条目捕获方式。围栏语法、渲染策略与全部代码为独立实现。

## 许可证

MIT，见 [LICENSE](LICENSE)。各插件目录内保留自己的 LICENSE，其中包含所借鉴项目的原始版权声明。
