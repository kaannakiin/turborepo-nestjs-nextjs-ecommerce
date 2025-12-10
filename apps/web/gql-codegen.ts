import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  // URL yerine dosya yolunu veriyoruz.
  // apps/web klasöründen iki kere geri çıkıp backend'e gidiyoruz.
  schema: "../backend/apps/backend/src/schema.gql",
  documents: ["src/**/*.tsx", "src/**/*.ts"],
  generates: {
    "./src/gql/": {
      preset: "client",
      plugins: [],
    },
  },
  ignoreNoDocuments: true,
};

export default config;
