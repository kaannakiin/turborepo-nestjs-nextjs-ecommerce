import { z } from "zod";
export const BaseSeoSchema = z.object({
  metaTitle: z
    .string({ error: "Meta başlık gereklidir." })
    .min(1, { error: "Meta başlık en az 1 karakter olmalıdır." })
    .max(256, { error: "Meta başlık en fazla 256 karakter olabilir." }),
  metaDescription: z
    .string({ error: "Meta açıklama gereklidir." })
    .min(1, { error: "Meta açıklama en az 1 karakter olmalıdır." })
    .max(512, { error: "Meta açıklama en fazla 512 karakter olabilir." }),
});

export type BaseSeoSchemaInputType = z.input<typeof BaseSeoSchema>;
export type BaseSeoSchemaOutputType = z.output<typeof BaseSeoSchema>;

export const PageSeoSchema = BaseSeoSchema.safeExtend({
  index: z.boolean({ error: "Index durumu gereklidir." }).default(true),
  follow: z.boolean({ error: "Follow durumu gereklidir." }).default(true),
});

export type PageSeoSchemaInputType = z.input<typeof PageSeoSchema>;
export type PageSeoSchemaOutputType = z.output<typeof PageSeoSchema>;
