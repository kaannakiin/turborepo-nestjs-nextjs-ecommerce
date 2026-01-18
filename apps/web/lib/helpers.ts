import { Media } from '@/context/theme-context/ThemeContext';
import { MantineColor, MantineColorsTuple } from '@mantine/core';
import {
  CampaignOfferTargetPage,
  CampaignStatus,
  CampaignType,
  CardAssociation,
  CartStatus,
  Currency,
  DiscountType,
  Locale,
  OrderStatus,
  PaymentStatus,
  PaymentType,
  ProductType,
  UserRole,
} from '@repo/database/client';
import {
  AspectRatio,
  FontFamily,
  FontType,
  FullfillmentStrategyType,
  LocationType,
  MantineFontWeight,
  MantineSize,
  ProductPageDataType,
  ProductPageSortOption,
  ShippingRuleType,
  SortAdminUserTable,
  TextAlign,
  ThemeComponents,
  ThemePages,
  ThemeSections,
} from '@repo/types';

export function getUserRoleLabels(role: UserRole) {
  switch (role) {
    case 'ADMIN':
      return 'Admin';
    case 'OWNER':
      return 'Yönetici';
    default:
      return 'Kullanıcı';
  }
}

export function getMantineSizeLabel(size: MantineSize) {
  switch (size) {
    case MantineSize.xs:
      return 'Ekstra Küçük';
    case MantineSize.sm:
      return 'Küçük';
    case MantineSize.md:
      return 'Orta';
    case MantineSize.lg:
      return 'Büyük';
    case MantineSize.xl:
      return 'Ekstra Büyük';
  }
}

export function getMantineFontWeightLabel(weight: MantineFontWeight) {
  switch (weight) {
    case 'thin':
      return 'İnce';
    case 'normal':
      return 'Normal';
    case 'bold':
      return 'Kalın';
    case 'extralight':
      return 'Ekstra İnce';
    case 'light':
      return 'Hafif';
    case 'semibold':
      return 'Yarı Kalın';
    case 'medium':
      return 'Medium';
  }
}

export function getSortAdminUserTableLabels(sort: SortAdminUserTable) {
  switch (sort) {
    case SortAdminUserTable.nameAsc:
      return 'İsim A → Z';
    case SortAdminUserTable.nameDesc:
      return 'İsim Z → A';
    case SortAdminUserTable.createdAtAsc:
      return 'Eski → Yeni';
    case SortAdminUserTable.createdAtDesc:
      return 'Yeni → Eski';
    default:
      return 'Eski → Yeni';
  }
}

export function getProductTypeLabel(type: ProductType) {
  switch (type) {
    case 'PHYSICAL':
      return 'Fiziksel';
    case 'DIGITAL':
      return 'Dijital';
    default:
      return 'Fiziksel';
  }
}
export function getCurrencyLabel(currency: Currency) {
  switch (currency) {
    case 'TRY':
      return 'Türk Lirası (₺)';
    case 'USD':
      return 'ABD Doları ($)';
    case 'EUR':
      return 'Euro (€)';
    case 'GBP':
      return 'İngiliz Sterlini (£)';
    default:
      return currency;
  }
}

export function getCurrencySymbol(currency: Currency) {
  switch (currency) {
    case 'TRY':
      return '₺';
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    default:
      return currency;
  }
}

export function getCurrencyIntlFormat(currency: Currency) {
  switch (currency) {
    case 'TRY':
      return 'tr-TR';
    case 'USD':
      return 'en-US';
    case 'EUR':
      return 'de-DE';
    case 'GBP':
      return 'en-GB';
    default:
      return 'tr-TR';
  }
}

export function buildVariantOrProductUrl(
  productInfos: ProductPageDataType['translations'],
  variantInfos?: ProductPageDataType['variants'][number]['options'][number][],
  locale: Locale = 'TR',
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
          (t) => t.locale === locale,
        ) || variant.productVariantOption.variantOption.translations[0];

      const variantGroupTranslation =
        variant.productVariantOption.variantOption.variantGroup.translations.find(
          (t) => t.locale === locale,
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
    .padStart(2, '0');
  const gHex = Math.round((g + m) * 255)
    .toString(16)
    .padStart(2, '0');
  const bHex = Math.round((b + m) * 255)
    .toString(16)
    .padStart(2, '0');

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
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
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
      return 'Ortala';
    case TextAlign.right:
      return 'Sağa Hizala';
    case TextAlign.left:
      return 'Sola Hizala';
  }
}

export function getFontFamilyLabel(fontFamily: FontFamily): string {
  switch (fontFamily) {
    case FontFamily.system:
      return 'Sistem Font';
    case FontFamily.mantineDefault:
      return 'Mantine Varsayılan';

    case FontFamily.inter:
      return 'Inter';
    case FontFamily.roboto:
      return 'Roboto';
    case FontFamily.openSans:
      return 'Open Sans';
    case FontFamily.lato:
      return 'Lato';
    case FontFamily.montserrat:
      return 'Montserrat';
    case FontFamily.nunito:
      return 'Nunito';
    case FontFamily.poppins:
      return 'Poppins';
    case FontFamily.quicksand:
      return 'Quicksand';
    case FontFamily.raleway:
      return 'Raleway';

    case FontFamily.timesNewRoman:
      return 'Times New Roman';
    case FontFamily.georgia:
      return 'Georgia';
    case FontFamily.playfairDisplay:
      return 'Playfair Display';
    case FontFamily.merriweather:
      return 'Merriweather';
    case FontFamily.crimsonText:
      return 'Crimson Text';

    case FontFamily.jetBrainsMono:
      return 'JetBrains Mono';
    case FontFamily.firaCode:
      return 'Fira Code';
    case FontFamily.sourceCodePro:
      return 'Source Code Pro';
    case FontFamily.courierNew:
      return 'Courier New';

    case FontFamily.dancingScript:
      return 'Dancing Script';
    case FontFamily.greatVibes:
      return 'Great Vibes';

    case FontFamily.sansSerif:
      return 'Sans Serif';
    case FontFamily.serif:
      return 'Serif';
    case FontFamily.monospace:
      return 'Monospace';
    case FontFamily.cursive:
      return 'Cursive';

    default:
      return 'Bilinmeyen Font';
  }
}

export function getSelectionTextShipping(data: LocationType) {
  if (data.countryType === 'NONE') {
    return 'Tüm ülke';
  }

  if (data.countryType === 'STATE') {
    if (!data.stateIds || data.stateIds.length === 0) {
      return 'Tüm ülke';
    }

    const selectedCount = data.stateIds.length;
    if (selectedCount === 0) {
      return 'Tüm ülke';
    }

    return `${selectedCount} eyalet`;
  }

  if (data.countryType === 'CITY') {
    if (!data.cityIds || data.cityIds.length === 0) {
      return 'Tüm ülke';
    }

    const selectedCount = data.cityIds.length;
    if (selectedCount === 0) {
      return 'Tüm ülke';
    }

    return `${selectedCount} şehir`;
  }

  return 'Tüm ülke';
}

export const getConditionText = (data: ShippingRuleType) => {
  if (data.condition.type === 'SalesPrice') {
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
    return '-';
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
    return '-';
  }
};

export function calculateDiscountRate(
  price: number,
  discountedPrice: number,
): string {
  if (price <= 0) return '0%';
  if (discountedPrice >= price) return '0%';

  const discount = price - discountedPrice;
  const discountRate = (discount / price) * 100;

  return `${Math.round(discountRate * 10) / 10}%`;
}

export const cartStatusConfig: Record<
  CartStatus,
  { label: string; color: MantineColor }
> = {
  ABANDONED: { label: 'Terkedilmiş', color: 'red' },
  ACTIVE: { label: 'Aktif', color: 'green' },
  CONVERTED: { label: 'Satın Alınmış', color: 'blue' },
  MERGED: { label: 'Birleştirilmiş', color: 'gray' },
};

export function getCartStatusLabel(status: CartStatus): string {
  return cartStatusConfig[status].label;
}

export function getCartStatusColor(status: CartStatus): MantineColor {
  return cartStatusConfig[status].color;
}

export function getCartAssociationUrl(type: CardAssociation) {
  switch (type) {
    case 'VISA':
      return '/visa.svg';
    case 'AMERICAN_EXPRESS':
      return '/american-express.svg';
    case 'MASTER_CARD':
      return '/mastercard.svg';
    case 'TROY':
      return '/troy.svg';
  }
}

export function getOrderStatusInfos(status: OrderStatus): string {
  switch (status) {
    case 'CANCELLED':
      return 'Kargolanmadı';
    case 'CONFIRMED':
      return 'Onaylandı';
    case 'DELIVERED':
      return 'Teslim Edildi';
    case 'PENDING':
      return 'Beklemede';
    case 'PROCESSING':
      return 'İşleniyor';
    case 'SHIPPED':
      return 'Kargolandı';
    case 'REFUNDED':
      return 'İade Edildi';
  }
}
export function getOrderStatusColor(status: OrderStatus): MantineColor {
  switch (status) {
    case 'CANCELLED':
      return 'red.5';
    case 'CONFIRMED':
      return 'green.5';
    case 'DELIVERED':
      return 'blue.5';
    case 'PENDING':
      return 'yellow.5';
    case 'PROCESSING':
      return 'cyan.5';
    case 'REFUNDED':
      return 'grape.5';
    case 'SHIPPED':
      return 'teal.5';
  }
}

export function getDiscountTypeLabel(type: DiscountType): string {
  switch (type) {
    case 'FIXED_AMOUNT':
      return 'Sabit Tutar';
    case 'FREE_SHIPPING':
      return 'Ücretsiz Kargo';
    case 'PERCENTAGE':
      return 'Yüzdelik';
    case 'FIXED_AMOUNT_GROW_PRICE':
      return 'Sabit Tutar - Fiyat Bazlı Artan';
    case 'FIXED_AMOUNT_GROW_QUANTITY':
      return 'Sabit Tutar - Miktar Bazlı Artan';
    case 'PERCENTAGE_GROW_PRICE':
      return 'Yüzdelik - Fiyat Bazlı Artan';
    case 'PERCENTAGE_GROW_QUANTITY':
      return 'Yüzdelik - Miktar Bazlı Artan';
  }
}

export function getCampaignStatusLabel(status: CampaignStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'Aktif';
    case 'DRAFT':
      return 'Taslak';
    case 'ARCHIVED':
      return 'Arşivlenmiş';
    case 'SCHEDULED':
      return 'Planlanmış';
  }
}

export function getCampaignTypeLabel(type: CampaignType): string {
  switch (type) {
    case 'CROSS_SELLING':
      return '(Cross Sell) Çapraz Satış';
    case 'UP_SELLING':
      return '(Up Sell) Yukarı Satış';
  }
}

export function getCampaignOfferPageLabel(
  type: CampaignOfferTargetPage,
): string {
  switch (type) {
    case 'CHECKOUT_PAGE':
      return 'Ödeme Sayfası';
    case 'POST_CHECKOUT':
      return 'Ödeme Sonrası';
    case 'PRODUCT':
      return 'Ürün Sayfası';
  }
}

const PaymentStatusInfos: Record<
  PaymentStatus,
  { label: string; color: MantineColor }
> = {
  FAILED: { label: 'Başarısız', color: 'red.5' },
  PENDING: { label: 'Beklemede', color: 'yellow.5' },
  PARTIALLY_PAID: { label: 'Kısmen Ödendi', color: 'orange.5' },
  PAID: { label: 'Ödendi', color: 'green.5' },
};

export function getPaymentStatusLabel(status: PaymentStatus): string {
  return PaymentStatusInfos[status].label;
}

const PaymentTypeConfigs: Record<
  PaymentType,
  { label: string; color: MantineColor }
> = {
  CREDIT_CARD: { label: 'Kredi Kartı', color: 'blue.5' },
  DIRECT_DEBIT: { label: 'Banka Kartı', color: 'indigo.5' },
  APP_PAYMENT: { label: 'Uygulama İçi Ödeme', color: 'cyan.5' },
  CASH_ON_DELIVERY: { label: 'Kapıda Ödeme', color: 'teal.5' },
  CREDIT_CARD_ON_DELIVERY: { label: 'Kapıda Kredi Kartı', color: 'green.5' },
  CASH: { label: 'Nakit', color: 'lime.5' },
  BANK_REDIRECT: { label: 'Banka Yönlendirme', color: 'violet.5' },
  WALLET: { label: 'Dijital Cüzdan', color: 'grape.5' },
  BUY_ONLINE_PAY_AT_STORE: {
    label: 'Online Al Mağazada Öde',
    color: 'orange.5',
  },
  PAY_LATER: { label: 'Sonra Öde', color: 'yellow.5' },
  SLICE_IT: { label: 'Taksitle Öde', color: 'pink.5' },
  GIFT_CARD: { label: 'Hediye Kartı', color: 'red.5' },
  MONEY_ORDER: { label: 'Havale/EFT', color: 'gray.5' },
  OTHER: { label: 'Diğer', color: 'dark.3' },
};

export function getPaymentTypeLabel(type: PaymentType): string {
  return PaymentTypeConfigs[type]?.label || 'Bilinmeyen';
}

export const AspectRatioConfigs: Record<
  AspectRatio,
  {
    label: string;
    value: number;
  }
> = {
  auto: { label: 'Otomatik', value: 0 },
  '1/1': { label: '1:1 (Kare - Instagram Post)', value: 1 },
  '4/3': { label: '4:3 (Klasik TV)', value: 4 / 3 },
  '16/9': { label: '16:9 (Geniş Ekran - YouTube)', value: 16 / 9 },
};

export const getAspectRatioLabel = (ratio: AspectRatio): string => {
  return AspectRatioConfigs[ratio]?.label || 'Bilinmeyen';
};

export const getAspectRatioValue = (ratio: AspectRatio): number => {
  return AspectRatioConfigs[ratio]?.value || 0;
};

const ThemePageConfigs: Record<
  ThemePages,
  { label: string; value: ThemePages; createbleComponents?: ThemeComponents[] }
> = {
  HOMEPAGE: {
    label: 'Anasayfa',
    value: 'HOMEPAGE',
    createbleComponents: ['MARQUEE', 'PRODUCT_CAROUSEL', 'SLIDER'],
  },
  PRODUCT: {
    label: 'Ürün Sayfası',
    value: 'PRODUCT',
    createbleComponents: ['MARQUEE'],
  },
};

export function getThemePageLabel(page: ThemePages): string {
  return ThemePageConfigs[page]?.label || 'Bilinmeyen';
}

export function getThemePageValue(page: ThemePages): ThemePages {
  return ThemePageConfigs[page]?.value || 'HOMEPAGE';
}

export function getThemePageCreatebleComponents(
  page: ThemePages,
): ThemeComponents[] {
  const createbleComponentSet = new Set(
    ThemePageConfigs[page]?.createbleComponents,
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
  HEADER: { label: 'Header', value: 'HEADER' },
  FOOTER: { label: 'Footer', value: 'FOOTER' },
};

export const getThemeSectionLabel = (section: ThemeSections): string => {
  return ThemeSectionConfigs[section]?.label || 'Bilinmeyen';
};

export const getThemeSectionValue = (section: ThemeSections): ThemeSections => {
  return ThemeSectionConfigs[section]?.value || 'HEADER';
};

export const fontSelectData = [
  {
    group: 'Sans Serif (Modern & Temiz)',
    items: [
      { value: FontType.Inter, label: 'Inter' },
      { value: FontType.Roboto, label: 'Roboto' },
      { value: FontType.Open_Sans, label: 'Open Sans' },
      { value: FontType.Lato, label: 'Lato' },
      { value: FontType.Poppins, label: 'Poppins' },
      { value: FontType.Montserrat, label: 'Montserrat' },
      { value: FontType.Nunito, label: 'Nunito' },
      { value: FontType.Geist, label: 'Geist' },
    ],
  },
  {
    group: 'Serif (Klasik & Şık)',
    items: [
      { value: FontType.Playfair_Display, label: 'Playfair Display' },
      { value: FontType.Merriweather, label: 'Merriweather' },
      { value: FontType.Lora, label: 'Lora' },
      { value: FontType.Crimson_Text, label: 'Crimson Text' },
    ],
  },
  {
    group: 'Monospace (Kod & Teknik)',
    items: [
      { value: FontType.Roboto_Mono, label: 'Roboto Mono' },
      { value: FontType.Fira_Code, label: 'Fira Code' },
      { value: FontType.JetBrains_Mono, label: 'JetBrains Mono' },
      { value: FontType.Geist_Mono, label: 'Geist Mono' },
    ],
  },
  {
    group: 'Display & Diğerleri',
    items: [
      { value: FontType.Oswald, label: 'Oswald' },
      { value: FontType.Bebas_Neue, label: 'Bebas Neue' },
      { value: FontType.Anton, label: 'Anton' },
    ],
  },
];

/**
 * Tek bir hex renkten 10 shade'lik Mantine color tuple üretir
 * Mantine'in colors-generator mantığına benzer
 */
export function generateColorTuple(baseColor: string): MantineColorsTuple {
  const hex = baseColor.replace('#', '');

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
  b: number,
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
  l: number,
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
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

const fulfillmentStrategyTypesConfigs: Record<
  FullfillmentStrategyType,
  { label: string }
> = {
  COST_OPTIMAL: {
    label: 'Maliyet Optimizasyonu',
  },
  LOAD_BALANCE: {
    label: 'Yük Dengeleme',
  },
  MANUAL: {
    label: 'Manuel',
  },
  PROXIMITY: {
    label: 'Yakınlık',
  },
  STOCK_PRIORITY: {
    label: 'Stok Önceliği',
  },
};

export const getFulfillmentStrategyTypeLabel = (
  type: FullfillmentStrategyType,
): string => {
  return fulfillmentStrategyTypesConfigs[type]?.label || 'Bilinmeyen';
};

const localeConfigs: Record<Locale, { label: string }> = {
  TR: { label: 'Türkçe' },
  EN: { label: 'English' },
  DE: { label: 'Deutsch' },
};

export const getLocaleLabel = (locale: Locale): string => {
  return localeConfigs[locale]?.label || 'Bilinmeyen';
};

export const extractBaseDomain = (domain: string) => {
  const parts = domain.toLowerCase().split('.');
  if (parts.length >= 2) {
    return parts.slice(-2).join('.');
  }
  return domain.toLowerCase();
};

const productSortOptionConfig: Record<
  ProductPageSortOption,
  { label: string }
> = {
  'a-z': {
    label: 'A-Z',
  },
  'best-selling': {
    label: 'En Çok Satılan',
  },
  newest: {
    label: 'En Yeni',
  },
  'price-desc': {
    label: 'Fiyat: Yüksekten Düşüğe',
  },
  'price-asc': {
    label: 'Fiyat: Düşükten Yüksüğe',
  },
  'z-a': {
    label: 'Z-A',
  },
  oldest: {
    label: 'En Eski',
  },
};
export const getSortProductPageLabel = (
  option: ProductPageSortOption,
): string => {
  return productSortOptionConfig[option]?.label || 'Bilinmeyen';
};
