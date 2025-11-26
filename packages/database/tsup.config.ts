import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    client: "src/client.ts",
  },
  format: ["esm", "cjs"],
  dts: false,
  splitting: false,
  clean: true,
  external: ["@prisma/client", "@prisma/adapter-pg"],
  noExternal: [],
  treeshake: false,
  skipNodeModulesBundle: true,
});
