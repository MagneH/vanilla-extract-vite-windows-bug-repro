# vanilla-extract Vite `@id/C:/...` repro

Minimal repro for a `@vanilla-extract/vite-plugin` dev-mode failure when a workspace `*.css.ts` file is resolved as a Vite id shaped like `@id/C:/...`.

This sandbox intentionally uses `vite@6.3.3` so it can run in CodeSandbox's default Node 20.12.x environment without the newer Vite Node floor or the rolldown native binding issue.

## Run

```bash
pnpm install
pnpm dev
```

## Reproduce

1. Start the dev server.
2. Open `/__repro`.
3. Observe the `No CSS for file` error coming from `@vanilla-extract/compiler`.

If CodeSandbox keeps an older failed install around, restart the sandbox after the dependency change so it reinstalls with the updated `package.json`.

## Why this repro exists

The app imports a `*.css.ts` file from a sibling package outside the Vite app root.

The custom Vite plugin in `vite.config.ts` simulates the `@id/C:/...` id shape that has been observed in real projects:

```txt
/@id/C:/.../block.css.ts.vanilla.css
```

That means this sandbox can reproduce the underlying bug on macOS/Linux too, even though the same id shape appears to occur naturally in real projects primarily on Windows.

That path shape causes `@vanilla-extract/vite-plugin` to look up CSS using a mismatched file id and throw:

```txt
Error: No CSS for file: .../@id/C:/.../block.css.ts
```
