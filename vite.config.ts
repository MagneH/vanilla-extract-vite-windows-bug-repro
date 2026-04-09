import { fileURLToPath, URL } from "node:url";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import { defineConfig, normalizePath, type ViteDevServer } from "vite";

const appRoot = fileURLToPath(new URL("./apps/web", import.meta.url));
const sharedBlockCssFile = normalizePath(
  fileURLToPath(new URL("./packages/shared/src/block/block.css.ts", import.meta.url))
);

const reproduceVanillaExtractIdBug = () => ({
  name: "reproduce-vanilla-extract-id-bug",
  apply: "serve" as const,
  configureServer(server: ViteDevServer) {
    server.middlewares.use("/__repro", async (_req, res, next) => {
      try {
        // Warm the real module first so vanilla-extract has CSS cached for the actual file.
        await server.transformRequest("/src/main.ts");

        // Simulate the Vite id shape that seems to cause the compiler cache mismatch.
        const windowsVirtualCssId = `/@id/C:${sharedBlockCssFile}.vanilla.css`;
        await server.moduleGraph.getModuleByUrl(windowsVirtualCssId);

        res.statusCode = 200;
        res.end("Unexpectedly did not reproduce the bug.");
      } catch (error) {
        next(error);
      }
    });
  },
});

export default defineConfig({
  root: appRoot,
  plugins: [vanillaExtractPlugin(), reproduceVanillaExtractIdBug()],
});
