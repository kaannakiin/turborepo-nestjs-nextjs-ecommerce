import { z } from "zod";
import { DesignComponentType, FileSchema } from "../..";

export const OnboardGridItemBaseSchema = z.object({
  uniqueId: z.cuid2(),
  customImage: FileSchema({ type: ["IMAGE", "VIDEO"] }).nullish(),
  existingImage: z.url({ error: "Geçerli bir URL giriniz." }).nullish(),
  name: z
    .string({
      error: "Ad gereklidir.",
    })
    .min(1, { error: "Ad en az 1 karakter olmalıdır." })
    .max(128, {
      error: "Ad en fazla 128 karakter olmalıdır.",
    }),
  description: z
    .string({
      error: "Açıklama gereklidir.",
    })
    .min(1, { error: "Açıklama " })
    .max(512, { error: "" })
    .nullish(),
});

export const OnboardGridSchema = z.object({
  uniqueId: z.cuid2(),
  type: z.literal(DesignComponentType.ONBOARD_GRID),
  items: z.array(OnboardGridItemBaseSchema, {
    error: "Geçersiz item listesi.",
  }),
});

export type OnboardGridSchemaInputType = z.input<typeof OnboardGridSchema>;
export type OnboardGridSchemaOutputType = z.output<typeof OnboardGridSchema>;
