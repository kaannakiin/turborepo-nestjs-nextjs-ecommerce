import { z } from "zod";
import { DesignPageType } from "../common";
import { PageSeoSchema } from "../common/seo-schema";
import { DesignComponentsSchema } from "./design-components.schema";

export const DesignPageSchema = z.object({
  uniqueId: z.cuid2(),
  pageType: z.enum(DesignPageType, { error: "Geçersiz sayfa tipi." }),
  pageName: z
    .string({ error: "Sayfa adı gereklidir." })
    .min(1, { error: "Sayfa adı en az 1 karakter olmalıdır." })
    .max(256, { error: "Sayfa adı en fazla 256 karakter olabilir." }),
  components: z
    .array(DesignComponentsSchema, { error: "Geçersiz bileşen listesi." })
    .min(1, { error: "En az 1 bileşen eklemelisiniz." })
    .max(256, { error: "En fazla 256 bileşen ekleyebilirsiniz." }),
  seo: PageSeoSchema,
});

export type DesignPageSchemaInputType = z.input<typeof DesignPageSchema>;
export type DesignPageSchemaOutputType = z.output<typeof DesignPageSchema>;
