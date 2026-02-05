import { z } from "zod";
import {
  DesignComponentType,
  existingAssetSchema,
  FileSchema,
  OnboardGridItemLinkType,
  aspectRatioSchema,
  colorHex,
  componentBreakpointSchema,
} from "../../common/index";

export const DesignOnboardGridItemBaseSchema = z
  .object({
    uniqueId: z.cuid2(),
    customImage: FileSchema({ type: ["IMAGE", "VIDEO"] }).nullish(),
    existingImage: existingAssetSchema.nullish(),
    aspectRatio: aspectRatioSchema,
    titleColor: colorHex.nullish(),
    descriptionColor: colorHex.nullish(),
    slug: z.string().nullish(),
    customUrl: z.url().nullish(),
    buttonText: z.string().nullish(),
    buttonTextColor: colorHex.nullish(),
    buttonBackgroundColor: colorHex.nullish(),
    title: z
      .string({
        error: "Ad gereklidir.",
      })
      .min(1, { error: "Ad en az 1 karakter olmalıdır." })
      .max(128, {
        error: "Ad en fazla 128 karakter olmalıdır.",
      })
      .nullish(),
    description: z
      .string({
        error: "Açıklama gereklidir.",
      })
      .min(1, { error: "Açıklama " })
      .max(512, { error: "" })
      .nullish(),
    linkType: z
      .enum(OnboardGridItemLinkType, {
        error: "Lütfen geçerli bir link türü seçiniz.",
      })
      .nullish(),
    brandId: z.cuid2().nullish(),
    categoryId: z.cuid2().nullish(),
    tagId: z.cuid2().nullish(),
  })
  .check(({ issues, value }) => {
    if (value.linkType === "BRAND") {
      if (!value.brandId) {
        issues.push({
          code: "custom",
          input: value.brandId,
          message: "Marka ID gereklidir",
        });
      }
    }
    if (value.linkType === "CATEGORY") {
      if (!value.categoryId) {
        issues.push({
          code: "custom",
          input: value.categoryId,
          message: "Kategori ID gereklidir",
        });
      }
    }
    if (value.linkType === "TAG") {
      if (!value.tagId) {
        issues.push({
          code: "custom",
          input: value.tagId,
          message: "Etiket ID gereklidir",
        });
      }
    }
  });

export const DesignOnboardGridSchema = z.object({
  uniqueId: z.cuid2(),
  type: z.literal(DesignComponentType.ONBOARD_GRID),
  title: z
    .string()
    .min(1, { error: "Başlık en az 1 karakter olmalıdır." })
    .max(256, { error: "Başlık en fazla 256 karakter olabilir." })
    .nullish(),
  description: z
    .string()
    .min(1, { error: "Açıklama en az 1 karakter olmalıdır." })
    .max(512, { error: "Açıklama en fazla 512 karakter olabilir." })
    .nullish(),
  titleColor: colorHex.nullish(),
  descriptionColor: colorHex.nullish(),
  items: z.array(DesignOnboardGridItemBaseSchema, {
    error: "Geçersiz item listesi.",
  }),
  breakPoints: componentBreakpointSchema,
});

export type DesignOnboardGridItemBaseSchemaInputType = z.input<
  typeof DesignOnboardGridItemBaseSchema
>;
export type DesignOnboardGridItemBaseSchemaOutputType = z.output<
  typeof DesignOnboardGridItemBaseSchema
>;

export type DesignOnboardGridSchemaInputType = z.input<
  typeof DesignOnboardGridSchema
>;
export type DesignOnboardGridSchemaOutputType = z.output<
  typeof DesignOnboardGridSchema
>;
