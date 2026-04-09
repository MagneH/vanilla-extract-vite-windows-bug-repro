# vanilla-extract Vite `@id/absolute-path` repro

Minimal repro for a `@vanilla-extract/vite-plugin` dev-mode failure when a workspace `*.css.ts` file is resolved from a Vite id wrapped in `@id/...`.

This sandbox intentionally uses `vite@6.3.3` so it can run in CodeSandbox's default Node 20.12.x environment without the newer Vite Node floor or the rolldown native binding issue.

## Run

```bash
pnpm install
pnpm dev
```

## Reproduce

1. Start the dev server.
2. Open `/__repro`.
3. Observe the JSON response.

If CodeSandbox keeps an older failed install around, restart the sandbox after the dependency change so it reinstalls with the updated `package.json`.

## Why this repro exists

The app imports a `*.css.ts` file from a sibling package outside the Vite app root.

The custom route in `vite.config.ts` warms the real `*.css.ts` file and then calls vanilla-extract's own `resolveId` and `load` hooks with an `@id`-wrapped absolute path:

```txt
/@id//Users/.../block.css.ts.vanilla.css
```

Using a real macOS/Linux absolute path avoids the extra cross-platform path semantics you get from fake `C:/...` ids on POSIX, while still exercising the same underlying `@id/absolute-path` normalization bug.

Expected behavior with the published plugin:

```txt
500 Internal Server Error
No CSS for file: .../@id/Users/.../block.css.ts
```

Expected behavior with the fixed fork:

```json
{
  "source": "/@id//Users/.../block.css.ts.vanilla.css",
  "resolvedId": "/Users/.../block.css.ts.vanilla.css",
  "loadedCss": true
}
```
