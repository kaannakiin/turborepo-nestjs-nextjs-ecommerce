import * as z from "zod";
import { FileSchema } from "../../../products/product-schemas";
import { colorHex } from "../../../shared-schema";
import {
  MantineSize,
  TextAlign,
  ThemeComponents,
} from "../../../shared/shared-enum";

export const AnouncementItemSchema = z.object({
  text: z
    .string({
      error: "Anons metni bir metin olmalıdır.",
    })
    .min(1, { message: "Anons metni en az 1 karakter olmalıdır." })
    .max(255, { message: "Anons metni en fazla 255 karakter olabilir." }),
  fontSize: z.enum(MantineSize, {
    error: "Geçerli bir font boyutu seçiniz.",
  }),
  backgroundColor: colorHex.nullish(),
  textColor: colorHex.nullish(),
});

export const AnouncementSchema = z.object({
  items: z
    .array(AnouncementItemSchema, {
      error: "Anons öğeleri bir dizi olmalıdır.",
    })
    .min(1, { message: "En az bir anons öğesi ekleyiniz." })
    .max(10, { error: "En fazla on anons öğesi ekleyebilirsiniz." }),
});

export const LogoSchema = z.object({
  file: FileSchema({
    type: ["LOGO", "IMAGE"],
    maxSize: 5 * 1024 * 1024,
  }).nullish(),
  alt: z
    .string({ error: "Alt metni bir metin olmalıdır." })
    .max(255, { message: "Alt metni en fazla 255 karakter olabilir." })
    .nullish(),
  position: z
    .enum(TextAlign, {
      error: "Geçerli bir logo hizalaması seçiniz.",
    })
    .nullish(),
});

export type LogoSchemaType = z.infer<typeof LogoSchema>;

export type AnouncementItemSchemaType = z.infer<typeof AnouncementItemSchema>;
export type AnouncementSchemaType = z.infer<typeof AnouncementSchema>;

export const HeaderSchema = z.object({
  type: z.literal<ThemeComponents>("HEADER"),
  componentId: z.cuid2(),
  logo: LogoSchema,
  anouncementBar: AnouncementSchema.nullish(),
});

export type HeaderSchemaType = z.infer<typeof HeaderSchema>;
