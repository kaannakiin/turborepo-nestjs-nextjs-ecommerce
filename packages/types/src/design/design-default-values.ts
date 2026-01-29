import { StoreType } from "@repo/database/client";
import { DesignName, DesignPageType } from "../common";
import { DesignSchemaInputType } from ".";
import { createId } from "@paralleldrive/cuid2";

export const DEFAULT_EMPTY_DESIGN: DesignSchemaInputType = {
  logo: null as unknown as File,
  storeType: StoreType.B2C,
  designType: DesignName.MODERN,
  isActive: false,
  pages: [
    {
      uniqueId: createId(),
      pageType: DesignPageType.HOME,
      pageName: "Ana Sayfa",
      components: [],
      seo: {
        metaTitle: "Ana Sayfa",
        metaDescription: "Ana sayfa aciklamasi",
      },
    },
  ],
};

export const DEFAULT_MODERN_DESIGN: DesignSchemaInputType = {
  logo: null as unknown as File,
  storeType: StoreType.B2C,
  designType: DesignName.MODERN,
  isActive: false,
  pages: [
    {
      uniqueId: createId(),
      pageType: DesignPageType.HOME,
      pageName: "Ana Sayfa",
      components: [],
      seo: {
        metaTitle: "Modern E-Ticaret | Ana Sayfa",
        metaDescription: "Modern ve sik tasarimli e-ticaret magaza ana sayfasi",
      },
    },
    {
      uniqueId: createId(),
      pageType: DesignPageType.CATEGORY,
      pageName: "Kategori Sayfasi",
      components: [],
      seo: {
        metaTitle: "Kategoriler",
        metaDescription: "Urun kategorilerine goz atin",
      },
    },
  ],
};

export const DEFAULT_ELEGANT_DESIGN: DesignSchemaInputType = {
  logo: null as unknown as File,
  storeType: StoreType.B2C,
  designType: DesignName.ELEGANT,
  isActive: false,
  pages: [
    {
      uniqueId: createId(),
      pageType: DesignPageType.HOME,
      pageName: "Ana Sayfa",
      components: [],
      seo: {
        metaTitle: "Elegant E-Ticaret | Ana Sayfa",
        metaDescription: "Zarafet ve stil bir arada",
      },
    },
  ],
};

export const DEFAULT_MINIMAL_DESIGN: DesignSchemaInputType = {
  logo: null as unknown as File,
  storeType: StoreType.B2C,
  designType: DesignName.MINIMAL,
  isActive: false,
  pages: [
    {
      uniqueId: createId(),
      pageType: DesignPageType.HOME,
      pageName: "Ana Sayfa",
      components: [],
      seo: {
        metaTitle: "Minimal E-Ticaret | Ana Sayfa",
        metaDescription: "Sadelik ve islevsellik",
      },
    },
  ],
};

// Default design map by design type
export const DEFAULT_DESIGNS_BY_TYPE: Record<
  DesignName,
  DesignSchemaInputType
> = {
  [DesignName.MODERN]: DEFAULT_MODERN_DESIGN,
  [DesignName.ELEGANT]: DEFAULT_ELEGANT_DESIGN,
  [DesignName.MINIMAL]: DEFAULT_MINIMAL_DESIGN,
  [DesignName.CLASSIC]: DEFAULT_EMPTY_DESIGN,
  [DesignName.VIBRANT]: DEFAULT_EMPTY_DESIGN,
};

// Helper function to get default design
export function getDefaultDesign(
  designType: DesignName = DesignName.MODERN,
): DesignSchemaInputType {
  return DEFAULT_DESIGNS_BY_TYPE[designType] || DEFAULT_EMPTY_DESIGN;
}
