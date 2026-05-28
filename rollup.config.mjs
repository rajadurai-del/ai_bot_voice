import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import { readFileSync, copyFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(__dirname, "package.json"), "utf8"));

const banner = `/**
 * ${pkg.name} v${pkg.version}
 * (c) ${new Date().getFullYear()} ${pkg.author}
 * Released under the ${pkg.license} license.
 */`;

function copyTypesPlugin() {
  return {
    name: "copy-types",
    buildEnd() {
      const dist = resolve(__dirname, "dist");
      if (!existsSync(dist)) mkdirSync(dist, { recursive: true });
      copyFileSync(resolve(__dirname, "src/index.d.ts"), resolve(dist, "index.d.ts"));
      copyFileSync(resolve(__dirname, "src/react.d.ts"), resolve(dist, "react.d.ts"));
      copyFileSync(resolve(__dirname, "src/vue.d.ts"), resolve(dist, "vue.d.ts"));
    }
  };
}

const corePlugins = [nodeResolve()];

export default [
  // Core: ESM
  {
    input: "src/index.js",
    output: { file: "dist/index.mjs", format: "es", sourcemap: true, banner },
    plugins: corePlugins
  },
  // Core: CommonJS
  {
    input: "src/index.js",
    output: {
      file: "dist/index.cjs",
      format: "cjs",
      sourcemap: true,
      banner,
      exports: "named"
    },
    plugins: corePlugins
  },
  // Core: UMD (browser global) — unminified
  {
    input: "src/index.js",
    output: {
      file: "dist/ambernexus-ai_bot_voice.umd.js",
      format: "umd",
      name: "AmbernexusAiBotVoice",
      sourcemap: true,
      banner,
      exports: "named"
    },
    plugins: corePlugins
  },
  // Core: UMD minified
  {
    input: "src/index.js",
    output: {
      file: "dist/ambernexus-ai_bot_voice.min.js",
      format: "umd",
      name: "AmbernexusAiBotVoice",
      sourcemap: true,
      banner,
      exports: "named"
    },
    plugins: [...corePlugins, terser({ format: { comments: /^\!|@preserve|@license|@cc_on/i } })]
  },

  // React wrapper: ESM
  {
    input: "src/react.js",
    external: ["react", pkg.name],
    output: { file: "dist/react.mjs", format: "es", sourcemap: true, banner },
    plugins: [nodeResolve()]
  },
  // React wrapper: CommonJS
  {
    input: "src/react.js",
    external: ["react", pkg.name],
    output: {
      file: "dist/react.cjs",
      format: "cjs",
      sourcemap: true,
      banner,
      exports: "named"
    },
    plugins: [nodeResolve()]
  },

  // Vue wrapper: ESM
  {
    input: "src/vue.js",
    external: ["vue", pkg.name],
    output: { file: "dist/vue.mjs", format: "es", sourcemap: true, banner },
    plugins: [nodeResolve(), copyTypesPlugin()]
  },
  // Vue wrapper: CommonJS
  {
    input: "src/vue.js",
    external: ["vue", pkg.name],
    output: {
      file: "dist/vue.cjs",
      format: "cjs",
      sourcemap: true,
      banner,
      exports: "named"
    },
    plugins: [nodeResolve()]
  }
];
