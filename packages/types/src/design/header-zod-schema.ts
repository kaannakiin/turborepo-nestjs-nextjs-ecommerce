import { z } from "zod";
import { HeaderLinkType } from "../common";
export const BaseHeaderLink = z.object({
  uniqueId: z.cuid2({
    error: "Geçersiz link ID.",
  }),
  customName: z
    .string({
      error: "Link adı string olmalıdır.",
    })
    .min(1, {
      error: "Link adı en az 1 karakter uzunluğunda olmalıdır.",
    })
    .max(64, {
      error: "Link adı en fazla 64 karakter uzunluğunda olmalıdır.",
    })
    .nullish(),
});

export const HeaderLinks = z.discriminatedUnion("type", [
  BaseHeaderLink.safeExtend({
    type: z.literal<HeaderLinkType>(HeaderLinkType.CATEGORY),
  }),
  BaseHeaderLink.safeExtend({
    type: z.literal<HeaderLinkType>(HeaderLinkType.BRAND),
  }),
  BaseHeaderLink.safeExtend({
    type: z.literal<HeaderLinkType>(HeaderLinkType.PRODUCT),
  }),
  z.object({
    type: z.literal<HeaderLinkType>(HeaderLinkType.CUSTOM_URL),
    url: z.url({
      error: "Geçersiz URL",
    }),
  }),
  z.object({
    type: z.literal<HeaderLinkType>(HeaderLinkType.SUBMENU),
  }),
]);
export const HeaderSchema = z.object({});

export type HeaderSchemaInputType = z.input<typeof HeaderSchema>;
export type HeaderSchemaOutputType = z.output<typeof HeaderSchema>;
