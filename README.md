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
scripts/
  sync-index.mjs               从 plugins/ 生成 market-index.json
  check-all.mjs                逐个跑各插件的语法检查
  test-all.mjs                 逐个跑各插件的单测
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
npm run index          # 重新生成 market-index.json
npm run index:check    # 只比对，不一致则非零退出
```

**发版流程**：改完插件 → `npm test` → `npm run index` → 提交（`market-index.json` 里的 commit 必须已推送，否则索引指向一个拉不到的提交）。CI 会跑 `index:check` 挡住漏更新的索引。

## 致谢与许可

**dsh-skills-manager**

- 目录扫描、frontmatter 解析与整体形态参考 [pengxiaozi/dsh-plugins](https://github.com/pengxiaozi/dsh-plugins) 的 `dsh-skill-panel`（MIT）。该插件的 lib 与 client 代码为重写，实测与参考项目几乎无相同行，仅形态沿用。

**dsh-usage-stats**

- 看板实现衍生自 [axuan-1314/dsh-usage-stats](https://github.com/axuan-1314/dsh-usage-stats)（MIT）：核心逻辑 `lib/aggregate.js`、`lib/store.js`、`lib/fold.js`、`lib/index.js` 与其有 64%–97% 相同行，故沿用其原始版权声明。
- 早期版本源自 [Make0209/dsh-usage-stats](https://github.com/Make0209/dsh-usage-stats)（MIT），本插件重做了看板（`lib/client.js` 仅约 38% 相同）。
- 界面形态参考 [zai-org/ZCode](https://github.com/zai-org/ZCode)（Apache-2.0）的「使用统计」面板设计，配色取其 CSS 变量真值，不含其代码。
- 采集与折叠语义对齐官方 `@deepseek-ai/dsh-token-meter` 的 `tokenUsage` 投影，不含其代码。

## 许可证

MIT，见 [LICENSE](LICENSE)。各插件目录内保留自己的 LICENSE，其中包含所借鉴项目的原始版权声明。
