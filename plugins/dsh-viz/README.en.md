# dsh-viz

**English** | [中文](README.md)

DeepSeek Harness plugin: lets the model render an HTML page as an **interactive in-conversation visualization**. The model writes the page to a file and drops a `viz` fence in its reply; the plugin renders it in a sandboxed iframe.

## What it is for

DSH replies are Markdown by default. When the model needs to "show a prototype", "make an interactive chart" or "compare two designs", it normally can only paste a code block or ask the user to open a file. This plugin adds an in-conversation rendering path:

1. The model writes a complete, self-contained HTML page to `<workspace>/.dsh/visualizations/<name>.html`.
2. It drops a fence in its reply (absolute path):

   ````text
   ```viz
   {"path":"/abs/path/to/<workspace>/.dsh/visualizations/<name>.html","title":"optional","height":420}
   ```
   ````

   The fence body may also be **just the path** (one line; forward slashes recommended to avoid escaping):

   ````text
   ```viz
   C:/path/to/<workspace>/.dsh/visualizations/<name>.html
   ```
   ````

3. The plugin replaces the fence with a sandboxed iframe rendered after the reply body.

Multiple fences in one reply render in order.

## Identity

| Item | Value |
|---|---|
| npm package | `@bluechonk/dsh-viz` |
| loader row id | `@bluechonk/dsh-viz` |
| client module id | `@bluechonk/dsh-viz` (must match the package name exactly) |
| Host route | `GET /dsh-viz/file?path=<absolute-path>` |

## Safety

- The route accepts loopback, same-origin requests only.
- The path must be absolute and its real path (after resolving symlinks) must stay inside `<dshHome>/visualizations` or a registered workspace. Escapes, relative paths, directories and files over 1 MB get a 404.
- The iframe uses `sandbox="allow-scripts"`: no same-origin access, no forms, popups or top-level navigation.
- Responses carry a strict CSP, `X-Content-Type-Options: nosniff` and `Cache-Control: no-store`.

## Skill

The package ships `skills/viz/SKILL.md`. DSH discovers skills from skill roots only, so copy it into one:

```bash
mkdir -p ~/.dsh/skills
cp -r plugins/dsh-viz/skills/viz ~/.dsh/skills/viz
```

## Development

```bash
npm install           # at the repository root, installs esbuild (build only)
npm run build         # bundles every src/client/ into its client/client.js
npm test              # node:test (27 cases: fence parsing / path allowlist / file route / client wiring)
npm run check         # syntax check (lib / client / src)
```

See [docs/DESIGN-AND-VERIFICATION.md](docs/DESIGN-AND-VERIFICATION.md) for the design record and [CHANGELOG.md](CHANGELOG.md) for version history.

## Credits and license

MIT License, see [LICENSE](LICENSE).

The "shadow the `assistant-step` chat node" approach follows the same host extension point as the community plugin [dsh-genui](https://github.com/omdsh-dev/dsh-genui) (MIT); this plugin's code, fence syntax and rendering strategy are an independent implementation.
