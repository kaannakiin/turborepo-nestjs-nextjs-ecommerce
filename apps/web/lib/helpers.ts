import { Media } from "@/context/theme-context/ThemeContext";
import { MantineColor, MantineColorsTuple } from "@mantine/core";
import {
  CampaignOfferTargetPage,
  CampaignStatus,
  CampaignType,
  CardAssociation,
  CartStatus,
  Currency,
  DiscountType,
  FulfillmentDecisionType,
  Locale,
  LogicalOperator,
  OrderStatus,
  PaymentStatus,
  PaymentType,
  ProductType,
  RegistrationSource,
  UserRole,
} from "@repo/database/client";
import {
  AspectRatio,
  ConditionOperator,
  CustomerGroupSmartFields,
  FontFamily,
  FontType,
  FulfillmentActionType,
  FulfillmentConditionField,
  FulfillmentStrategyType,
  LocationType,
  MantineFontWeight,
  MantineSize,
  ProductPageDataType,
  ShippingRuleType,
  SortAdminUserTable,
  TextAlign,
  ThemeComponents,
  ThemePages,
  ThemeSections,
  TimeUnit,
} from "@repo/types";

export function getUserRoleLabels(role: UserRole) {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "OWNER":
      return "Yönetici";
    default:
      return "Kullanıcı";
  }
}

export function getMantineSizeLabel(size: MantineSize) {
  switch (size) {
    case MantineSize.xs:
      return "Ekstra Küçük";
    case MantineSize.sm:
      return "Küçük";
    case MantineSize.md:
      return "Orta";
    case MantineSize.lg:
      return "Büyük";
    case MantineSize.xl:
      return "Ekstra Büyük";
  }
}

export function getMantineFontWeightLabel(weight: MantineFontWeight) {
  switch (weight) {
    case "thin":
      return "İnce";
    case "normal":
      return "Normal";
    case "bold":
      return "Kalın";
    case "extralight":
      return "Ekstra İnce";
    case "light":
      return "Hafif";
    case "semibold":
      return "Yarı Kalın";
    case "medium":
      return "Medium";
  }
}

export function getSortAdminUserTableLabels(sort: SortAdminUserTable) {
  switch (sort) {
    case SortAdminUserTable.nameAsc:
      return "İsim A → Z";
    case SortAdminUserTable.nameDesc:
      return "İsim Z → A";
    case SortAdminUserTable.createdAtAsc:
      return "Eski → Yeni";
    case SortAdminUserTable.createdAtDesc:
      return "Yeni → Eski";
    default:
      return "Eski → Yeni";
  }
}

export function getProductTypeLabel(type: ProductType) {
  switch (type) {
    case "PHYSICAL":
      return "Fiziksel";
    case "DIGITAL":
      return "Dijital";
    default:
      return "Fiziksel";
  }
}
export function getCurrencyLabel(currency: Currency) {
  switch (currency) {
    case "TRY":
      return "Türk Lirası (₺)";
    case "USD":
      return "ABD Doları ($)";
    case "EUR":
      return "Euro (€)";
    case "GBP":
      return "İngiliz Sterlini (£)";
    default:
      return currency;
  }
}

export function getCurrencySymbol(currency: Currency) {
  switch (currency) {
    case "TRY":
      return "₺";
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    default:
      return currency;
  }
}

export function getCurrencyIntlFormat(currency: Currency) {
  switch (currency) {
    case "TRY":
      return "tr-TR";
    case "USD":
      return "en-US";
    case "EUR":
      return "de-DE";
    case "GBP":
      return "en-GB";
    default:
      return "tr-TR";
  }
}

export function buildVariantOrProductUrl(
  productInfos: ProductPageDataType["translations"],
  variantInfos?: ProductPageDataType["variants"][number]["options"][number][],
  locale: Locale = "TR"
) {
  const productTranslation =
    productInfos.find((tr) => tr.locale === locale) || productInfos[0];

  if (!productTranslation) return null;

  const baseSlug = productTranslation.slug;

  if (variantInfos && variantInfos.length > 0) {
    const searchParams = new URLSearchParams();

    variantInfos.forEach((variant) => {
      const variantTranslation =
        variant.productVariantOption.variantOption.translations.find(
          (t) => t.locale === locale
        ) || variant.productVariantOption.variantOption.translations[0];

      const variantGroupTranslation =
        variant.productVariantOption.variantOption.variantGroup.translations.find(
          (t) => t.locale === locale
        ) ||
        variant.productVariantOption.variantOption.variantGroup.translations[0];

      if (variantTranslation && variantGroupTranslation) {
        searchParams.set(variantGroupTranslation.slug, variantTranslation.slug);
      }
    });

    return `/${baseSlug}?${searchParams.toString()}`;
  }

  return `/${baseSlug}`;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

function hexToHsl(hex: string): HSL {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s, l };
}

function hslToHex(h: number, s: number, l: number): string {
  h = h % 360;
  if (h < 0) h += 360;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  const rHex = Math.round((r + m) * 255)
    .toString(16)
    .padStart(2, "0");
  const gHex = Math.round((g + m) * 255)
    .toString(16)
    .padStart(2, "0");
  const bHex = Math.round((b + m) * 255)
    .toString(16)
    .padStart(2, "0");

  return `#${rHex}${gHex}${bHex}`;
}

function adjustColorForExtreme(hex: string): string {
  const { h, s, l } = hexToHsl(hex);

  const adjustedH = h;
  let adjustedS = s;
  let adjustedL = l;

  if (l < 0.05) {
    adjustedL = 0.15;
    adjustedS = Math.max(s, 0.3);
  }

  if (l > 0.95) {
    adjustedL = 0.85;
    adjustedS = Math.max(s, 0.1);
  }

  if (s < 0.05) {
    adjustedS = 0.3;
  }

  return hslToHex(adjustedH, adjustedS, adjustedL);
}

export function hexToMantineColorsTuple(hex: string): MantineColorsTuple {
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  cleanHex = `#${cleanHex}`;

  const adjustedHex = adjustColorForExtreme(cleanHex);
  const { h, s, l } = hexToHsl(adjustedHex);

  const lightnessList = [
    0.95, 0.85, 0.75, 0.65, 0.55, 0.45, 0.35, 0.25, 0.15, 0.05,
  ];

  const originalLightness = l;
  let targetIndex = 5;

  for (let i = 0; i < lightnessList.length; i++) {
    if (
      Math.abs(lightnessList[i] - originalLightness) <
      Math.abs(lightnessList[targetIndex] - originalLightness)
    ) {
      targetIndex = i;
    }
  }

  const colors: string[] = [];

  for (let i = 0; i < 10; i++) {
    if (i === targetIndex) {
      colors.push(adjustedHex.toUpperCase());
    } else {
      let adjustedSaturation = s;

      if (lightnessList[i] > 0.8) {
        adjustedSaturation = s * (1 - (lightnessList[i] - 0.8) * 2);
      }

      if (lightnessList[i] < 0.2) {
        adjustedSaturation = Math.min(1, s * 1.2);
      }

      const newColor = hslToHex(h, adjustedSaturation, lightnessList[i]);
      colors.push(newColor.toUpperCase());
    }
  }

  return colors as unknown as MantineColorsTuple;
}

export function getTextAlignLabel(align: TextAlign): string {
  switch (align) {
    case TextAlign.center:
      return "Ortala";
    case TextAlign.right:
      return "Sağa Hizala";
    case TextAlign.left:
      return "Sola Hizala";
  }
}

export function getFontFamilyLabel(fontFamily: FontFamily): string {
  switch (fontFamily) {
    case FontFamily.system:
      return "Sistem Font";
    case FontFamily.mantineDefault:
      return "Mantine Varsayılan";

    case FontFamily.inter:
      return "Inter";
    case FontFamily.roboto:
      return "Roboto";
    case FontFamily.openSans:
      return "Open Sans";
    case FontFamily.lato:
      return "Lato";
    case FontFamily.montserrat:
      return "Montserrat";
    case FontFamily.nunito:
      return "Nunito";
    case FontFamily.poppins:
      return "Poppins";
    case FontFamily.quicksand:
      return "Quicksand";
    case FontFamily.raleway:
      return "Raleway";

    case FontFamily.timesNewRoman:
      return "Times New Roman";
    case FontFamily.georgia:
      return "Georgia";
    case FontFamily.playfairDisplay:
      return "Playfair Display";
    case FontFamily.merriweather:
      return "Merriweather";
    case FontFamily.crimsonText:
      return "Crimson Text";

    case FontFamily.jetBrainsMono:
      return "JetBrains Mono";
    case FontFamily.firaCode:
      return "Fira Code";
    case FontFamily.sourceCodePro:
      return "Source Code Pro";
    case FontFamily.courierNew:
      return "Courier New";

    case FontFamily.dancingScript:
      return "Dancing Script";
    case FontFamily.greatVibes:
      return "Great Vibes";

    case FontFamily.sansSerif:
      return "Sans Serif";
    case FontFamily.serif:
      return "Serif";
    case FontFamily.monospace:
      return "Monospace";
    case FontFamily.cursive:
      return "Cursive";

    default:
      return "Bilinmeyen Font";
  }
}

export function getSelectionTextShipping(data: LocationType) {
  if (data.countryType === "NONE") {
    return "Tüm ülke";
  }

  if (data.countryType === "STATE") {
    if (!data.stateIds || data.stateIds.length === 0) {
      return "Tüm ülke";
    }

    const selectedCount = data.stateIds.length;
    if (selectedCount === 0) {
      return "Tüm ülke";
    }

    return `${selectedCount} eyalet`;
  }

  if (data.countryType === "CITY") {
    if (!data.cityIds || data.cityIds.length === 0) {
      return "Tüm ülke";
    }

    const selectedCount = data.cityIds.length;
    if (selectedCount === 0) {
      return "Tüm ülke";
    }

    return `${selectedCount} şehir`;
  }

  return "Tüm ülke";
}

export const getConditionText = (data: ShippingRuleType) => {
  if (data.condition.type === "SalesPrice") {
    const min = data.condition.minSalesPrice;
    const max = data.condition.maxSalesPrice;
    const currency = getCurrencySymbol(data.currency);

    if (min && max) {
      return `${currency}${min} - ${currency}${max} arası`;
    } else if (min) {
      return `${currency}${min} ve üzeri`;
    } else if (max) {
      return `${currency}${max}  altı`;
    }
    return "-";
  } else {
    const min = data.condition.minProductWeight;
    const max = data.condition.maxProductWeight;

    if (min && max) {
      return `${min}g - ${max}g arası`;
    } else if (min) {
      return `${min}g ve üzeri`;
    } else if (max) {
      return `${max}g altı`;
    }
    return "-";
  }
};

export function calculateDiscountRate(
  price: number,
  discountedPrice: number
): string {
  if (price <= 0) return "0%";
  if (discountedPrice >= price) return "0%";

  const discount = price - discountedPrice;
  const discountRate = (discount / price) * 100;

  return `${Math.round(discountRate * 10) / 10}%`;
}

export const cartStatusConfig: Record<
  CartStatus,
  { label: string; color: MantineColor }
> = {
  ABANDONED: { label: "Terkedilmiş", color: "red" },
  ACTIVE: { label: "Aktif", color: "green" },
  CONVERTED: { label: "Satın Alınmış", color: "blue" },
  MERGED: { label: "Birleştirilmiş", color: "gray" },
};

export function getCartStatusLabel(status: CartStatus): string {
  return cartStatusConfig[status].label;
}

export function getCartStatusColor(status: CartStatus): MantineColor {
  return cartStatusConfig[status].color;
}

export function getCartAssociationUrl(type: CardAssociation) {
  switch (type) {
    case "VISA":
      return "/visa.svg";
    case "AMERICAN_EXPRESS":
      return "/american-express.svg";
    case "MASTER_CARD":
      return "/mastercard.svg";
    case "TROY":
      return "/troy.svg";
  }
}

export function getOrderStatusInfos(status: OrderStatus): string {
  switch (status) {
    case "CANCELLED":
      return "Kargolanmadı";
    case "CONFIRMED":
      return "Onaylandı";
    case "DELIVERED":
      return "Teslim Edildi";
    case "PENDING":
      return "Beklemede";
    case "PROCESSING":
      return "İşleniyor";
    case "SHIPPED":
      return "Kargolandı";
    case "REFUNDED":
      return "İade Edildi";
  }
}
export function getOrderStatusColor(status: OrderStatus): MantineColor {
  switch (status) {
    case "CANCELLED":
      return "red.5";
    case "CONFIRMED":
      return "green.5";
    case "DELIVERED":
      return "blue.5";
    case "PENDING":
      return "yellow.5";
    case "PROCESSING":
      return "cyan.5";
    case "REFUNDED":
      return "grape.5";
    case "SHIPPED":
      return "teal.5";
  }
}

export function getDiscountTypeLabel(type: DiscountType): string {
  switch (type) {
    case "FIXED_AMOUNT":
      return "Sabit Tutar";
    case "FREE_SHIPPING":
      return "Ücretsiz Kargo";
    case "PERCENTAGE":
      return "Yüzdelik";
    case "FIXED_AMOUNT_GROW_PRICE":
      return "Sabit Tutar - Fiyat Bazlı Artan";
    case "FIXED_AMOUNT_GROW_QUANTITY":
      return "Sabit Tutar - Miktar Bazlı Artan";
    case "PERCENTAGE_GROW_PRICE":
      return "Yüzdelik - Fiyat Bazlı Artan";
    case "PERCENTAGE_GROW_QUANTITY":
      return "Yüzdelik - Miktar Bazlı Artan";
  }
}

export function getCampaignStatusLabel(status: CampaignStatus): string {
  switch (status) {
    case "ACTIVE":
      return "Aktif";
    case "DRAFT":
      return "Taslak";
    case "ARCHIVED":
      return "Arşivlenmiş";
    case "SCHEDULED":
      return "Planlanmış";
  }
}

export function getCampaignTypeLabel(type: CampaignType): string {
  switch (type) {
    case "CROSS_SELLING":
      return "(Cross Sell) Çapraz Satış";
    case "UP_SELLING":
      return "(Up Sell) Yukarı Satış";
  }
}

export function getCampaignOfferPageLabel(
  type: CampaignOfferTargetPage
): string {
  switch (type) {
    case "CHECKOUT_PAGE":
      return "Ödeme Sayfası";
    case "POST_CHECKOUT":
      return "Ödeme Sonrası";
    case "PRODUCT":
      return "Ürün Sayfası";
  }
}

const PaymentStatusInfos: Record<
  PaymentStatus,
  { label: string; color: MantineColor }
> = {
  FAILED: { label: "Başarısız", color: "red.5" },
  PENDING: { label: "Beklemede", color: "yellow.5" },
  PARTIALLY_PAID: { label: "Kısmen Ödendi", color: "orange.5" },
  PAID: { label: "Ödendi", color: "green.5" },
};

export function getPaymentStatusLabel(status: PaymentStatus): string {
  return PaymentStatusInfos[status].label;
}

const PaymentTypeConfigs: Record<
  PaymentType,
  { label: string; color: MantineColor }
> = {
  CREDIT_CARD: { label: "Kredi Kartı", color: "blue.5" },
  DIRECT_DEBIT: { label: "Banka Kartı", color: "indigo.5" },
  APP_PAYMENT: { label: "Uygulama İçi Ödeme", color: "cyan.5" },
  CASH_ON_DELIVERY: { label: "Kapıda Ödeme", color: "teal.5" },
  CREDIT_CARD_ON_DELIVERY: { label: "Kapıda Kredi Kartı", color: "green.5" },
  CASH: { label: "Nakit", color: "lime.5" },
  BANK_REDIRECT: { label: "Banka Yönlendirme", color: "violet.5" },
  WALLET: { label: "Dijital Cüzdan", color: "grape.5" },
  BUY_ONLINE_PAY_AT_STORE: {
    label: "Online Al Mağazada Öde",
    color: "orange.5",
  },
  PAY_LATER: { label: "Sonra Öde", color: "yellow.5" },
  SLICE_IT: { label: "Taksitle Öde", color: "pink.5" },
  GIFT_CARD: { label: "Hediye Kartı", color: "red.5" },
  MONEY_ORDER: { label: "Havale/EFT", color: "gray.5" },
  OTHER: { label: "Diğer", color: "dark.3" },
};

export function getPaymentTypeLabel(type: PaymentType): string {
  return PaymentTypeConfigs[type]?.label || "Bilinmeyen";
}

export const AspectRatioConfigs: Record<
  AspectRatio,
  {
    label: string;
    value: number;
  }
> = {
  auto: { label: "Otomatik", value: 0 },
  "1/1": { label: "1:1 (Kare - Instagram Post)", value: 1 },
  "4/3": { label: "4:3 (Klasik TV)", value: 4 / 3 },
  "3/4": { label: "3:4 (Dikey - Portre)", value: 3 / 4 },
  "16/9": { label: "16:9 (Geniş Ekran - YouTube)", value: 16 / 9 },
  "9/16": { label: "9:16 (Dikey Video - TikTok, Reels)", value: 9 / 16 },
  "21/9": { label: "21:9 (Ultra Geniş - Sinema)", value: 21 / 9 },
  "2/1": { label: "2:1 (Panorama)", value: 2 / 1 },
  "3/2": { label: "3:2 (DSLR Fotoğraf)", value: 3 / 2 },
  "2/3": { label: "2/3 (Portre Fotoğraf)", value: 2 / 3 },
  "5/4": { label: "5:4 (Klasik Monitor)", value: 5 / 4 },
  "4/5": { label: "4:5 (Instagram Portre)", value: 4 / 5 },
};

export const getAspectRatioLabel = (ratio: AspectRatio): string => {
  return AspectRatioConfigs[ratio]?.label || "Bilinmeyen";
};

export const getAspectRatioValue = (ratio: AspectRatio): number => {
  return AspectRatioConfigs[ratio]?.value || 0;
};

const ThemePageConfigs: Record<
  ThemePages,
  { label: string; value: ThemePages; createbleComponents?: ThemeComponents[] }
> = {
  HOMEPAGE: {
    label: "Anasayfa",
    value: "HOMEPAGE",
    createbleComponents: ["MARQUEE", "PRODUCT_CAROUSEL", "SLIDER"],
  },
  PRODUCT: {
    label: "Ürün Sayfası",
    value: "PRODUCT",
    createbleComponents: ["MARQUEE"],
  },
};

export function getThemePageLabel(page: ThemePages): string {
  return ThemePageConfigs[page]?.label || "Bilinmeyen";
}

export function getThemePageValue(page: ThemePages): ThemePages {
  return ThemePageConfigs[page]?.value || "HOMEPAGE";
}

export function getThemePageCreatebleComponents(
  page: ThemePages
): ThemeComponents[] {
  const createbleComponentSet = new Set(
    ThemePageConfigs[page]?.createbleComponents
  );
  return [...createbleComponentSet];
}

const MediaConfigs: Record<Media, { breakpoint: number }> = {
  desktop: { breakpoint: 1024 },
  tablet: { breakpoint: 768 },
  mobile: { breakpoint: 0 },
};

export function getMediaBreakpoint(media: Media): number {
  return MediaConfigs[media]?.breakpoint || 0;
}

const ThemeSectionConfigs: Record<
  ThemeSections,
  { label: string; value: ThemeSections }
> = {
  HEADER: { label: "Header", value: "HEADER" },
  FOOTER: { label: "Footer", value: "FOOTER" },
};

export const getThemeSectionLabel = (section: ThemeSections): string => {
  return ThemeSectionConfigs[section]?.label || "Bilinmeyen";
};

export const getThemeSectionValue = (section: ThemeSections): ThemeSections => {
  return ThemeSectionConfigs[section]?.value || "HEADER";
};

export const fontSelectData = [
  {
    group: "Sans Serif (Modern & Temiz)",
    items: [
      { value: FontType.Inter, label: "Inter" },
      { value: FontType.Roboto, label: "Roboto" },
      { value: FontType.Open_Sans, label: "Open Sans" },
      { value: FontType.Lato, label: "Lato" },
      { value: FontType.Poppins, label: "Poppins" },
      { value: FontType.Montserrat, label: "Montserrat" },
      { value: FontType.Nunito, label: "Nunito" },
      { value: FontType.Geist, label: "Geist" },
    ],
  },
  {
    group: "Serif (Klasik & Şık)",
    items: [
      { value: FontType.Playfair_Display, label: "Playfair Display" },
      { value: FontType.Merriweather, label: "Merriweather" },
      { value: FontType.Lora, label: "Lora" },
      { value: FontType.Crimson_Text, label: "Crimson Text" },
    ],
  },
  {
    group: "Monospace (Kod & Teknik)",
    items: [
      { value: FontType.Roboto_Mono, label: "Roboto Mono" },
      { value: FontType.Fira_Code, label: "Fira Code" },
      { value: FontType.JetBrains_Mono, label: "JetBrains Mono" },
      { value: FontType.Geist_Mono, label: "Geist Mono" },
    ],
  },
  {
    group: "Display & Diğerleri",
    items: [
      { value: FontType.Oswald, label: "Oswald" },
      { value: FontType.Bebas_Neue, label: "Bebas Neue" },
      { value: FontType.Anton, label: "Anton" },
    ],
  },
];

/**
 * Tek bir hex renkten 10 shade'lik Mantine color tuple üretir
 * Mantine'in colors-generator mantığına benzer
 */
export function generateColorTuple(baseColor: string): MantineColorsTuple {
  const hex = baseColor.replace("#", "");

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  const { h, s, l } = rgbToHsl(r, g, b);

  const shades: string[] = [];

  const lightnessSteps = [0.95, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];

  for (let i = 0; i < 10; i++) {
    const adjustedSaturation =
      s * (1 - Math.abs(lightnessSteps[i] - 0.5) * 0.5);
    const newL = lightnessSteps[i];

    const rgb = hslToRgb(h, adjustedSaturation, newL);
    shades.push(rgbToHex(rgb.r, rgb.g, rgb.b));
  }

  return shades as [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ];
}

function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h, s, l };
}

function hslToRgb(
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

const FULFILLMENT_DECISION_TYPE_LABELS: Record<
  FulfillmentDecisionType,
  { label: string; description?: string }
> = {
  AUTO_ASSIGNED: {
    label: "Otomatik Atandı",
    description: "Sistem tarafından otomatik olarak atandı",
  },
  SPLIT_SHIPMENT: {
    label: "Bölündü",
    description: "Sipariş birden fazla gönderiye bölündü",
  },
  DROPSHIP: {
    label: "Dropship",
    description: "Dropship tedarikçisine yönlendirildi",
  },
  BACKORDER: {
    label: "Backorder",
    description: "Stok beklemesine alındı",
  },
  MANUAL_REQUIRED: {
    label: "Manuel Müdahale",
    description: "Manuel müdahale gerekli",
  },
  REJECTED: {
    label: "Reddedildi",
    description: "Sipariş karşılanamadı",
  },
};

export const getFulfillmentDecisionTypeLabel = (
  type: FulfillmentDecisionType
): string => {
  return FULFILLMENT_DECISION_TYPE_LABELS[type]?.label ?? "Bilinmeyen";
};

export const getFulfillmentDecisionTypeInfo = (
  type: FulfillmentDecisionType
) => {
  return FULFILLMENT_DECISION_TYPE_LABELS[type] ?? { label: "Bilinmeyen" };
};

const LOGICAL_OPERATOR_LABELS: Record<
  LogicalOperator,
  { label: string; description: string }
> = {
  AND: {
    label: "VE",
    description: "Tüm koşullar sağlanmalı",
  },
  OR: {
    label: "VEYA",
    description: "Koşullardan en az biri sağlanmalı",
  },
};

export const getLogicalOperatorLabel = (operator: LogicalOperator): string => {
  return LOGICAL_OPERATOR_LABELS[operator]?.label ?? "Bilinmeyen";
};

export const getLogicalOperatorInfo = (operator: LogicalOperator) => {
  return LOGICAL_OPERATOR_LABELS[operator] ?? { label: "Bilinmeyen" };
};

const CONDITION_OPERATOR_LABELS: Record<
  ConditionOperator,
  { label: string; shortLabel: string; description: string; symbol?: string }
> = {
  EQ: {
    label: "Eşit",
    shortLabel: "=",
    description: "Değer eşit olmalı",
    symbol: "=",
  },
  NEQ: {
    label: "Eşit Değil",
    shortLabel: "≠",
    description: "Değer eşit olmamalı",
    symbol: "≠",
  },
  GT: {
    label: "Büyük",
    shortLabel: ">",
    description: "Değer büyük olmalı",
    symbol: ">",
  },
  GTE: {
    label: "Büyük veya Eşit",
    shortLabel: "≥",
    description: "Değer büyük veya eşit olmalı",
    symbol: "≥",
  },
  LT: {
    label: "Küçük",
    shortLabel: "<",
    description: "Değer küçük olmalı",
    symbol: "<",
  },
  LTE: {
    label: "Küçük veya Eşit",
    shortLabel: "≤",
    description: "Değer küçük veya eşit olmalı",
    symbol: "≤",
  },

  IN: {
    label: "İçinde",
    shortLabel: "içinde",
    description: "Değer listede bulunmalı",
  },
  NOT_IN: {
    label: "İçinde Değil",
    shortLabel: "içinde değil",
    description: "Değer listede bulunmamalı",
  },

  BETWEEN: {
    label: "Arasında",
    shortLabel: "arasında",
    description: "Değer belirtilen aralıkta olmalı",
  },

  CONTAINS: {
    label: "İçerir",
    shortLabel: "içerir",
    description: "Metin belirtilen değeri içermeli",
  },
  NOT_CONTAINS: {
    label: "İçermez",
    shortLabel: "içermez",
    description: "Metin belirtilen değeri içermemeli",
  },
  STARTS_WITH: {
    label: "İle Başlar",
    shortLabel: "ile başlar",
    description: "Metin belirtilen değer ile başlamalı",
  },
  ENDS_WITH: {
    label: "İle Biter",
    shortLabel: "ile biter",
    description: "Metin belirtilen değer ile bitmeli",
  },
  IS_EMPTY: {
    label: "Boş",
    shortLabel: "boş",
    description: "Değer boş olmalı",
  },
  IS_NOT_EMPTY: {
    label: "Boş Değil",
    shortLabel: "boş değil",
    description: "Değer boş olmamalı",
  },

  HAS_ANY: {
    label: "Herhangi Birini İçerir",
    shortLabel: "birini içerir",
    description: "Belirtilen değerlerden en az birini içermeli",
  },
  HAS_ALL: {
    label: "Hepsini İçerir",
    shortLabel: "hepsini içerir",
    description: "Belirtilen değerlerin tamamını içermeli",
  },
  HAS_NONE: {
    label: "Hiçbirini İçermez",
    shortLabel: "hiçbirini içermez",
    description: "Belirtilen değerlerin hiçbirini içermemeli",
  },
  EXISTS: {
    label: "Var",
    shortLabel: "var",
    description: "İlişki mevcut olmalı",
  },
  NOT_EXISTS: {
    label: "Yok",
    shortLabel: "yok",
    description: "İlişki mevcut olmamalı",
  },

  IS_NULL: {
    label: "Boş (Null)",
    shortLabel: "null",
    description: "Değer null olmalı",
  },
  IS_NOT_NULL: {
    label: "Dolu (Not Null)",
    shortLabel: "not null",
    description: "Değer null olmamalı",
  },

  IS_TRUE: {
    label: "Doğru",
    shortLabel: "doğru",
    description: "Değer true olmalı",
  },
  IS_FALSE: {
    label: "Yanlış",
    shortLabel: "yanlış",
    description: "Değer false olmalı",
  },

  BEFORE: {
    label: "Önce",
    shortLabel: "önce",
    description: "Tarih belirtilen tarihten önce olmalı",
  },
  AFTER: {
    label: "Sonra",
    shortLabel: "sonra",
    description: "Tarih belirtilen tarihten sonra olmalı",
  },
  ON_DATE: {
    label: "O Tarihte",
    shortLabel: "tarihinde",
    description: "Tarih belirtilen tarihte olmalı",
  },
  WITHIN_LAST: {
    label: "Son ... İçinde",
    shortLabel: "son ... içinde",
    description: "Tarih son belirtilen süre içinde olmalı",
  },
  NOT_WITHIN_LAST: {
    label: "Son ... İçinde Değil",
    shortLabel: "son ... içinde değil",
    description: "Tarih son belirtilen süre içinde olmamalı",
  },
  WITHIN_NEXT: {
    label: "Gelecek ... İçinde",
    shortLabel: "gelecek ... içinde",
    description: "Tarih gelecek belirtilen süre içinde olmalı",
  },
  NOT_WITHIN_NEXT: {
    label: "",
    shortLabel: "",
    description: "",
    symbol: "",
  },
};

export const getConditionOperatorLabel = (
  operator: ConditionOperator
): string => {
  return CONDITION_OPERATOR_LABELS[operator]?.label ?? "Bilinmeyen";
};

export const getConditionOperatorShortLabel = (
  operator: ConditionOperator
): string => {
  return CONDITION_OPERATOR_LABELS[operator]?.shortLabel ?? "?";
};

export const getConditionOperatorInfo = (operator: ConditionOperator) => {
  return CONDITION_OPERATOR_LABELS[operator] ?? { label: "Bilinmeyen" };
};

type FieldType =
  | "numeric"
  | "date"
  | "boolean"
  | "enum"
  | "relation"
  | "string";

const CUSTOMER_SEGMENT_FIELD_LABELS: Record<
  CustomerGroupSmartFields,
  { label: string; description: string; type: FieldType }
> = {
  ORDER_COUNT: {
    label: "Sipariş Sayısı",
    description: "Toplam sipariş adedi",
    type: "numeric",
  },
  TOTAL_SPENT: {
    label: "Toplam Harcama",
    description: "Toplam harcanan tutar",
    type: "numeric",
  },
  AVERAGE_ORDER_VALUE: {
    label: "Ortalama Sipariş Tutarı",
    description: "Ortalama sipariş değeri",
    type: "numeric",
  },

  LAST_ORDER_DATE: {
    label: "Son Sipariş Tarihi",
    description: "En son sipariş verilen tarih",
    type: "date",
  },
  FIRST_ORDER_DATE: {
    label: "İlk Sipariş Tarihi",
    description: "İlk sipariş verilen tarih",
    type: "date",
  },
  CREATED_AT: {
    label: "Kayıt Tarihi",
    description: "Müşteri kayıt tarihi",
    type: "date",
  },
  EMAIL_VERIFIED_AT: {
    label: "E-posta Doğrulama Tarihi",
    description: "E-posta doğrulama tarihi",
    type: "date",
  },
  PHONE_VERIFIED_AT: {
    label: "Telefon Doğrulama Tarihi",
    description: "Telefon doğrulama tarihi",
    type: "date",
  },

  IS_EMAIL_VERIFIED: {
    label: "E-posta Doğrulandı",
    description: "E-posta adresi doğrulandı mı",
    type: "boolean",
  },
  IS_PHONE_VERIFIED: {
    label: "Telefon Doğrulandı",
    description: "Telefon numarası doğrulandı mı",
    type: "boolean",
  },
  HAS_ORDERS: {
    label: "Siparişi Var",
    description: "En az bir siparişi var mı",
    type: "boolean",
  },
  HAS_ADDRESS: {
    label: "Adresi Var",
    description: "Kayıtlı adresi var mı",
    type: "boolean",
  },

  ACCOUNT_STATUS: {
    label: "Hesap Durumu",
    description: "Müşteri hesap durumu",
    type: "enum",
  },
  REGISTRATION_SOURCE: {
    label: "Kayıt Kaynağı",
    description: "Müşterinin kayıt olduğu kaynak",
    type: "enum",
  },
  SUBSCRIPTION_STATUS: {
    label: "Abonelik Durumu",
    description: "Bülten abonelik durumu",
    type: "enum",
  },

  CUSTOMER_TAGS: {
    label: "Müşteri Etiketleri",
    description: "Müşteriye atanan etiketler",
    type: "relation",
  },
  CUSTOMER_GROUPS: {
    label: "Müşteri Grupları",
    description: "Müşterinin dahil olduğu gruplar",
    type: "relation",
  },
  PRICE_LIST: {
    label: "Fiyat Listesi",
    description: "Müşteriye atanan fiyat listesi",
    type: "relation",
  },

  COUNTRY: {
    label: "Ülke",
    description: "Müşteri adresi ülkesi",
    type: "string",
  },
  STATE: {
    label: "İl/Eyalet",
    description: "Müşteri adresi ili",
    type: "string",
  },
  CITY: {
    label: "İlçe/Şehir",
    description: "Müşteri adresi ilçesi",
    type: "string",
  },
  DISTRICT: {
    label: "Mahalle/Semt",
    description: "Müşteri adresi mahallesi",
    type: "string",
  },
};

export const getCustomerSegmentFieldLabel = (
  field: CustomerGroupSmartFields
): string => {
  return CUSTOMER_SEGMENT_FIELD_LABELS[field]?.label ?? "Bilinmeyen";
};

export const getCustomerSegmentFieldInfo = (
  field: CustomerGroupSmartFields
) => {
  return CUSTOMER_SEGMENT_FIELD_LABELS[field] ?? { label: "Bilinmeyen" };
};

const FULFILLMENT_CONDITION_FIELD_LABELS: Record<
  FulfillmentConditionField,
  { label: string; description: string; type: FieldType }
> = {
  CUSTOMER_TYPE: {
    label: "Müşteri Tipi",
    description: "Müşteri tipi (bireysel/kurumsal)",
    type: "enum",
  },
  CUSTOMER_GROUP: {
    label: "Müşteri Grubu",
    description: "Müşterinin grubu",
    type: "relation",
  },

  ORDER_TOTAL: {
    label: "Sipariş Toplamı",
    description: "Sipariş toplam tutarı",
    type: "numeric",
  },
  ORDER_ITEM_COUNT: {
    label: "Ürün Adedi",
    description: "Siparişdeki toplam ürün sayısı",
    type: "numeric",
  },
  ORDER_WEIGHT: {
    label: "Sipariş Ağırlığı",
    description: "Sipariş toplam ağırlığı",
    type: "numeric",
  },
  ORDER_CURRENCY: {
    label: "Para Birimi",
    description: "Sipariş para birimi",
    type: "enum",
  },

  PRODUCT_TAG: {
    label: "Ürün Etiketi",
    description: "Ürünlerin etiketleri",
    type: "relation",
  },
  PRODUCT_CATEGORY: {
    label: "Ürün Kategorisi",
    description: "Ürünlerin kategorileri",
    type: "relation",
  },
  PRODUCT_BRAND: {
    label: "Ürün Markası",
    description: "Ürünlerin markaları",
    type: "relation",
  },

  SHIPPING_METHOD: {
    label: "Kargo Yöntemi",
    description: "Seçilen kargo yöntemi",
    type: "relation",
  },
  DESTINATION_COUNTRY: {
    label: "Hedef Ülke",
    description: "Teslimat adresi ülkesi",
    type: "string",
  },
  DESTINATION_STATE: {
    label: "Hedef İl",
    description: "Teslimat adresi ili",
    type: "string",
  },
  DESTINATION_CITY: {
    label: "Hedef İlçe",
    description: "Teslimat adresi ilçesi",
    type: "string",
  },

  DAY_OF_WEEK: {
    label: "Haftanın Günü",
    description: "Siparişin verildiği gün",
    type: "enum",
  },
  TIME_OF_DAY: {
    label: "Günün Saati",
    description: "Siparişin verildiği saat aralığı",
    type: "string",
  },
  IS_HOLIDAY: {
    label: "Tatil Günü",
    description: "Resmi tatil günü mü",
    type: "boolean",
  },
  STOCK_LEVEL: {
    label: "",
    description: "",
    type: "string",
  },
  LOCATION_TYPE: {
    label: "",
    description: "",
    type: "string",
  },
  SUPPLIER_LEAD_TIME: {
    label: "",
    description: "",
    type: "string",
  },
};

export const getFulfillmentConditionFieldLabel = (
  field: FulfillmentConditionField
): string => {
  return FULFILLMENT_CONDITION_FIELD_LABELS[field]?.label ?? "Bilinmeyen";
};

export const getFulfillmentConditionFieldInfo = (
  field: FulfillmentConditionField
) => {
  return FULFILLMENT_CONDITION_FIELD_LABELS[field] ?? { label: "Bilinmeyen" };
};

const TIME_UNIT_LABELS: Record<
  TimeUnit,
  { label: string; pluralLabel: string; shortLabel: string }
> = {
  MINUTES: {
    label: "Dakika",
    pluralLabel: "Dakika",
    shortLabel: "dk",
  },
  HOURS: {
    label: "Saat",
    pluralLabel: "Saat",
    shortLabel: "sa",
  },
  DAYS: {
    label: "Gün",
    pluralLabel: "Gün",
    shortLabel: "gün",
  },
  WEEKS: {
    label: "Hafta",
    pluralLabel: "Hafta",
    shortLabel: "hf",
  },
  MONTHS: {
    label: "Ay",
    pluralLabel: "Ay",
    shortLabel: "ay",
  },
  YEARS: {
    label: "Yıl",
    pluralLabel: "Yıl",
    shortLabel: "yıl",
  },
};

export const getTimeUnitLabel = (unit: TimeUnit): string => {
  return TIME_UNIT_LABELS[unit]?.label ?? "Bilinmeyen";
};

export const getTimeUnitShortLabel = (unit: TimeUnit): string => {
  return TIME_UNIT_LABELS[unit]?.shortLabel ?? "?";
};

export const getTimeUnitInfo = (unit: TimeUnit) => {
  return TIME_UNIT_LABELS[unit] ?? { label: "Bilinmeyen" };
};

export const getEnumOptions = <T extends string>(
  labels: Record<T, { label: string }>
): Array<{ value: T; label: string }> => {
  return Object.entries(labels).map(([value, info]) => ({
    value: value as T,
    label: (info as { label: string }).label,
  }));
};

export const fulfillmentDecisionTypeOptions = getEnumOptions(
  FULFILLMENT_DECISION_TYPE_LABELS
);
export const logicalOperatorOptions = getEnumOptions(LOGICAL_OPERATOR_LABELS);
export const conditionOperatorOptions = getEnumOptions(
  CONDITION_OPERATOR_LABELS
);
export const customerSegmentFieldOptions = getEnumOptions(
  CUSTOMER_SEGMENT_FIELD_LABELS
);
export const fulfillmentConditionFieldOptions = getEnumOptions(
  FULFILLMENT_CONDITION_FIELD_LABELS
);

export const timeUnitOptions = getEnumOptions(TIME_UNIT_LABELS);

const OPERATORS_BY_FIELD_TYPE: Record<FieldType, ConditionOperator[]> = {
  numeric: ["EQ", "NEQ", "GT", "GTE", "LT", "LTE", "BETWEEN"],
  string: [
    "EQ",
    "NEQ",
    "CONTAINS",
    "NOT_CONTAINS",
    "STARTS_WITH",
    "ENDS_WITH",
    "IS_EMPTY",
    "IS_NOT_EMPTY",
    "IN",
    "NOT_IN",
  ],
  date: [
    "EQ",
    "BEFORE",
    "AFTER",
    "ON_DATE",
    "BETWEEN",
    "WITHIN_LAST",
    "NOT_WITHIN_LAST",
    "WITHIN_NEXT",
    "IS_NULL",
    "IS_NOT_NULL",
  ],
  boolean: ["IS_TRUE", "IS_FALSE", "IS_NULL", "IS_NOT_NULL"],
  enum: ["EQ", "NEQ", "IN", "NOT_IN", "IS_NULL", "IS_NOT_NULL"],
  relation: ["HAS_ANY", "HAS_ALL", "HAS_NONE", "EXISTS", "NOT_EXISTS"],
};

export const getOperatorsForFieldType = (
  fieldType: FieldType
): Array<{ value: ConditionOperator; label: string; shortLabel: string }> => {
  const operators = OPERATORS_BY_FIELD_TYPE[fieldType] || [];
  return operators.map((op) => ({
    value: op,
    label: CONDITION_OPERATOR_LABELS[op].label,
    shortLabel: CONDITION_OPERATOR_LABELS[op].shortLabel,
  }));
};

export const getOperatorsForCustomerSegmentField = (
  field: CustomerGroupSmartFields
) => {
  const fieldInfo = CUSTOMER_SEGMENT_FIELD_LABELS[field];
  return getOperatorsForFieldType(fieldInfo?.type || "string");
};

export const getOperatorsForFulfillmentConditionField = (
  field: FulfillmentConditionField
) => {
  const fieldInfo = FULFILLMENT_CONDITION_FIELD_LABELS[field];
  return getOperatorsForFieldType(fieldInfo?.type || "string");
};

const REGISTRATION_SOURCE: Record<
  RegistrationSource,
  { label: string; color: string }
> = {
  ADMIN_PANEL: { label: "Yönetim Paneli", color: "blue.6" },
  WEB_REGISTER: { label: "Web Sitesi", color: "green.6" },
  API: { label: "API", color: "cyan.6" },
  CHECKOUT_GUEST: { label: "Misafir Ödeme", color: "teal.6" },
  IMPORT_EXCEL: { label: "Excel İçe Aktarma", color: "orange.6" },
  PROVIDER_OAUTH: { label: "OAuth Sağlayıcı", color: "pink.6" },
};

export const getRegistrationSourceLabel = (
  source: RegistrationSource
): string => {
  return REGISTRATION_SOURCE[source]?.label || "Bilinmeyen";
};

export const getRegistrationSourceColor = (
  source: RegistrationSource
): string => {
  return REGISTRATION_SOURCE[source]?.color || "gray.6";
};

const FulfillmentFieldLabels: Record<
  FulfillmentConditionField,
  { label: string }
> = {
  ORDER_TOTAL: { label: "Sipariş Tutarı" },
  ORDER_ITEM_COUNT: { label: "Ürün Adedi" },
  ORDER_WEIGHT: { label: "Sipariş Ağırlığı (kg)" },
  ORDER_CURRENCY: { label: "Para Birimi" },
  DESTINATION_COUNTRY: { label: "Hedef Ülke" },
  DESTINATION_STATE: { label: "Hedef Eyalet/İl" },
  DESTINATION_CITY: { label: "Hedef Şehir" },
  PRODUCT_TAG: { label: "Ürün Etiketi" },
  PRODUCT_CATEGORY: { label: "Ürün Kategorisi" },
  PRODUCT_BRAND: { label: "Ürün Markası" },
  CUSTOMER_TYPE: { label: "Müşteri Tipi" },
  CUSTOMER_GROUP: { label: "Müşteri Grubu" },
  SHIPPING_METHOD: { label: "Kargo Yöntemi" },
  DAY_OF_WEEK: { label: "Haftanın Günü" },
  TIME_OF_DAY: { label: "Günün Saati" },
  IS_HOLIDAY: { label: "Tatil Günü" },
  STOCK_LEVEL: {
    label: "Stok Seviyesi",
  },
  LOCATION_TYPE: {
    label: "Lokasyon Türü",
  },
  SUPPLIER_LEAD_TIME: {
    label: "Tedarikçi Teslim Süresi",
  },
};

export const getFulfillmentFieldLabel = (
  field: FulfillmentConditionField
): string => {
  return (
    FulfillmentFieldLabels[field]?.label ||
    getFulfillmentConditionFieldLabel(field)
  );
};

const FulfillmentActionLabels: Record<
  FulfillmentActionType,
  { label: string }
> = {
  USE_LOCATION: { label: "Lokasyon Kullan" },
  EXCLUDE_LOCATION: { label: "Lokasyon Hariç Tut" },
  PREFER_LOCATION: { label: "Öncelikli Lokasyon" },
  ALLOW_SPLIT: { label: "Bölünmüş Gönderime İzin Ver" },
  DENY_SPLIT: { label: "Bölünmüş Gönderimi Engelle" },
  USE_DROPSHIP: { label: "Dropship Kullan" },
  BACKORDER: { label: "Ön Siparişe Al" },
  REJECT: { label: "Siparişi Reddet" },
  FLAG_FOR_REVIEW: {
    label: "Manuel İncelemeye Gönder",
  },
};

export const getFulfillmentActionLabel = (
  action: FulfillmentActionType
): string => {
  return FulfillmentActionLabels[action]?.label || "Bilinmeyen İşlem Türü";
};

const fullfillmentStrategyTypeConfigs: Record<
  FulfillmentStrategyType,
  { label: string }
> = {
  COST_OPTIMAL: { label: "Maliyet Optimizasyonu" },
  LOAD_BALANCE: { label: "Yük Dengeleme" },
  MANUAL: { label: "Manuel Müdahale" },
  PROXIMITY: { label: "Yakınlık Bazlı" },
  STOCK_PRIORITY: { label: "Stok Önceliği" },
};

export const getFulfillmentStrategyTypeLabel = (
  type: FulfillmentStrategyType
): string => {
  return fullfillmentStrategyTypeConfigs[type]?.label || "Bilinmeyen";
};
