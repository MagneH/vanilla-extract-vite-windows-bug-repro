import { fileURLToPath, URL } from "node:url";
import {
  defineConfig,
  normalizePath,
  type Plugin,
  type ViteDevServer,
} from "vite";

const { vanillaExtractPlugin } = await import(
  process.env.USE_LOCAL_VE_FORK === "1"
    ? "../vanilla-extract/packages/vite-plugin/dist/vanilla-extract-vite-plugin.esm.js"
    : "@vanilla-extract/vite-plugin"
);

const appRoot = fileURLToPath(new URL("./apps/web", import.meta.url));
const actualSharedBlockCssFile = normalizePath(
  fileURLToPath(new URL("./packages/shared/src/block/block.css.ts", import.meta.url))
);

const getHookHandler = <T extends (...args: never[]) => unknown>(
  hook: T | { handler: T } | undefined
) => (typeof hook === "function" ? hook : hook?.handler);

const vanillaExtractPlugins = vanillaExtractPlugin();

const vanillaExtractRuntimePlugin = vanillaExtractPlugins.find(
  (plugin: Plugin) => plugin.name === "vite-plugin-vanilla-extract"
);

const reproduceVanillaExtractIdBug = () => ({
  name: "reproduce-vanilla-extract-id-bug",
  apply: "serve" as const,
  configureServer(server: ViteDevServer) {
    server.middlewares.use("/__repro", async (_req, res, next) => {
      try {
        if (!vanillaExtractRuntimePlugin) {
          throw new Error("Could not find the vanilla-extract runtime plugin.");
        }

        // Warm the real absolute file first so the compiler cache is keyed by the true POSIX path.
        await server.transformRequest(actualSharedBlockCssFile);

        const resolveId = getHookHandler(vanillaExtractRuntimePlugin.resolveId);
        const load = getHookHandler(vanillaExtractRuntimePlugin.load);

        if (!resolveId || !load) {
          throw new Error("Could not access the vanilla-extract resolve/load hooks.");
        }

        // Exercise the plugin with the same @id/absolute-path shape, but using a real macOS path.
        const absoluteVirtualCssId = `/@id/${actualSharedBlockCssFile}.vanilla.css`;
        const resolvedId = await resolveId.call({} as never, absoluteVirtualCssId);

        if (typeof resolvedId !== "string") {
          throw new Error(`Expected resolveId to return a string, got ${String(resolvedId)}.`);
        }

        const css = await load.call({} as never, resolvedId);

        res.statusCode = 200;
        res.setHeader("content-type", "application/json");
        res.end(
          JSON.stringify(
            {
              source: absoluteVirtualCssId,
              resolvedId,
              loadedCss: typeof css === "string",
            },
            null,
            2
          )
        );
      } catch (error) {
        next(error);
      }
    });
  },
});

export default defineConfig({
  root: appRoot,
  plugins: [...vanillaExtractPlugins, reproduceVanillaExtractIdBug()],
});
