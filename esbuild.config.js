import esbuild from "esbuild";
import path from "path";

esbuild
  .build({
    entryPoints: ["./src/server.ts"],
    outdir: "dist",
    format: "esm",
    platform: "node",
    target: "es2020",
    sourcemap: true,
    bundle: false,
    splitting: false,
    outExtension: { ".js": ".js" },
    loader: {
      // TODO needed?
      ".json": "json",
    },
    absWorkingDir: path.resolve(import.meta.dirname),
  })
  .then(() => {
    console.log("Build complete");
    if (process.argv.includes("--watch")) {
      console.log("Watching for changes...");
    }
  })
  .catch(() => process.exit(1));
