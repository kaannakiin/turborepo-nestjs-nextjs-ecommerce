import { StoreType } from "@repo/database/client";
import { z } from "zod";
import { DesignName, FileSchema } from "../common";
import { DesignPageSchema } from "./design-page.schema";

export const DesignSchema = z.object({
  logo: FileSchema({
    type: ["IMAGE"],
    error: "Lütfen bir logo yükleyin.",
  }),
  storeType: z.enum(StoreType, { error: "Geçersiz mağaza tipi." }),
  designType: z.enum(DesignName, { error: "Geçersiz tasarım adı." }),
  isActive: z.boolean({ error: "Aktiflik durumu gereklidir." }),
  pages: z
    .array(DesignPageSchema, { error: "Geçersiz sayfa listesi." })
    .nullish(),
});

export type DesignSchemaInputType = z.input<typeof DesignSchema>;
export type DesignSchemaOutputType = z.output<typeof DesignSchema>;
