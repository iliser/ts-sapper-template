import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import svelte from "rollup-plugin-svelte";
import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import config from "sapper/config/rollup.js";
import pkg from "./package.json";
import autoPreprocess, { sass } from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";

// import postcss from 'rollup-plugin-postcss'

import alias from "@rollup/plugin-alias";

const hideUnsusedCss = true;

const aliases = alias({
  resolve: [".svelte"], //optional, by default this will just look for .js files or folders
  entries: [{ find: "components", replacement: "src/components" }],
});

const mode = process.env.NODE_ENV;
const dev = mode === "development";
const legacy = !!process.env.SAPPER_LEGACY_BUILD;

const onwarn = (warning, onwarn) => {
  return (
    (warning.code === "MISSING_EXPORT" && /'preload'/.test(warning.message)) ||
    (warning.code === "CIRCULAR_DEPENDENCY" &&
      /[/\\]@sapper[/\\]/.test(warning.message)) ||
    onwarn(warning)
  );
};

// import fs from "fs";
const svelte_onwarn = (warning, onwarn) => {
  if (warning.code === "css-unused-selector") return;
  // fs.appendFileSync("./err.log", warning.code + "\n");
  onwarn(warning);
};

export default {
  client: {
    input: config.client.input(),
    output: config.client.output(),
    plugins: [
      aliases,
      replace({
        "process.browser": true,
        "process.env.NODE_ENV": JSON.stringify(mode),
      }),
      svelte({
        preprocess: autoPreprocess(),
        dev,
        hydratable: true,
        emitCss: true,
        onwarn: svelte_onwarn,
      }),
      sass(),
      typescript({ sourceMap: dev }),
      resolve({
        browser: true,
        dedupe: ["svelte"],
      }),
      commonjs(),

      legacy &&
        babel({
          extensions: [".js", ".mjs", ".html", ".svelte"],
          babelHelpers: "runtime",
          exclude: ["node_modules/@babel/**"],
          presets: [
            [
              "@babel/preset-env",
              {
                targets: "> 0.25%, not dead",
              },
            ],
          ],
          plugins: [
            "@babel/plugin-syntax-dynamic-import",
            [
              "@babel/plugin-transform-runtime",
              {
                useESModules: true,
              },
            ],
          ],
        }),

      !dev &&
        terser({
          module: true,
        }),
    ],

    preserveEntrySignatures: false,
    onwarn,
  },

  server: {
    input: config.server.input(),
    output: config.server.output(),
    plugins: [
      aliases,
      replace({
        "process.browser": false,
        "process.env.NODE_ENV": JSON.stringify(mode),
      }),
      svelte({
        preprocess: autoPreprocess(),
        generate: "ssr",
        hydratable: true,
        dev,
        onwarn: svelte_onwarn,
      }),
      sass(),
      typescript({ sourceMap: dev }),
      resolve({
        dedupe: ["svelte"],
      }),
      commonjs(),
    ],
    external: Object.keys(pkg.dependencies).concat(
      require("module").builtinModules
    ),

    preserveEntrySignatures: "strict",
    onwarn,
  },

  serviceworker: {
    input: config.serviceworker.input(),
    output: config.serviceworker.output(),
    plugins: [
      resolve(),
      replace({
        "process.browser": true,
        "process.env.NODE_ENV": JSON.stringify(mode),
      }),
      commonjs(),
      !dev && terser(),
    ],

    preserveEntrySignatures: false,
    onwarn,
  },
};
