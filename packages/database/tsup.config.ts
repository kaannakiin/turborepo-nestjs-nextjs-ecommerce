import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    client: "src/client.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,

  external: [
    "@prisma/client",
    "@prisma/adapter-pg",
    "../generated/prisma/client.js",
    "../generated/prisma/index-browser.js",
  ],
  noExternal: [],
  treeshake: false,
  skipNodeModulesBundle: true,
});
