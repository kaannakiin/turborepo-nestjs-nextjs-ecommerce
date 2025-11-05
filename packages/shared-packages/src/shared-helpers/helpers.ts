import { $Enums } from "@repo/database";
import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";
import { de, enUS, tr } from "date-fns/locale";
export function slugify(text: string): string {
  if (!text || typeof text !== "string") return "";

  const turkishCharMap: Record<string, string> = {
    ç: "c",
    Ç: "C",
    ğ: "g",
    Ğ: "G",
    ı: "i",
    I: "I",
    İ: "i",
    ö: "o",
    Ö: "O",
    ş: "s",
    Ş: "S",
    ü: "u",
    Ü: "U",
  };

  let result = text.trim();
  for (const [turkish, latin] of Object.entries(turkishCharMap)) {
    result = result.replaceAll(turkish, latin);
  }

  return result
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100);
}

export class DateFormatter {
  /**
   * Locale'e göre date-fns locale objesini döndür
   */
  private static getLocale(locale: $Enums.Locale) {
    switch (locale) {
      case "TR":
        return tr;
      case "EN":
        return enUS;
      case "DE":
        return de;
      default:
        return tr;
    }
  }

  /**
   * Sadece tarih - 15 Oca 2025
   */
  static withDay(date: string | Date, locale: $Enums.Locale = "TR"): string {
    return format(new Date(date), "d MMM yyyy", {
      locale: this.getLocale(locale),
    });
  }

  /**
   * Tarih ve saat - 15 Oca 2025, 14:30
   */
  static withTime(date: string | Date, locale: $Enums.Locale = "TR"): string {
    return format(new Date(date), "d MMM yyyy, HH:mm", {
      locale: this.getLocale(locale),
    });
  }

  /**
   * Uzun tarih formatı - 15 Ocak 2025 Çarşamba
   */
  static withFullDay(
    date: string | Date,
    locale: $Enums.Locale = "TR"
  ): string {
    return format(new Date(date), "d MMMM yyyy EEEE", {
      locale: this.getLocale(locale),
    });
  }

  /**
   * Sadece saat - 14:30
   */
  static onlyTime(date: string | Date, locale: $Enums.Locale = "TR"): string {
    return format(new Date(date), "HH:mm", {
      locale: this.getLocale(locale),
    });
  }

  /**
   * Kısa tarih - 15.01.2025
   */
  static shortDate(date: string | Date, locale: $Enums.Locale = "TR"): string {
    return format(new Date(date), "dd.MM.yyyy", {
      locale: this.getLocale(locale),
    });
  }

  /**
   * Kısa tarih ve saat - 15.01.2025 14:30
   */
  static shortDateTime(
    date: string | Date,
    locale: $Enums.Locale = "TR"
  ): string {
    return format(new Date(date), "dd.MM.yyyy HH:mm", {
      locale: this.getLocale(locale),
    });
  }

  /**
   * Göreceli zaman - 2 saat önce, 3 gün önce
   */
  static relative(date: string | Date, locale: $Enums.Locale = "TR"): string {
    return formatDistanceToNow(new Date(date), {
      locale: this.getLocale(locale),
      addSuffix: true,
    });
  }

  /**
   * Ay ve yıl - Ocak 2025
   */
  static monthYear(date: string | Date, locale: $Enums.Locale = "TR"): string {
    return format(new Date(date), "MMMM yyyy", {
      locale: this.getLocale(locale),
    });
  }

  /**
   * Sadece gün adı - Çarşamba
   */
  static dayName(date: string | Date, locale: $Enums.Locale = "TR"): string {
    return format(new Date(date), "EEEE", {
      locale: this.getLocale(locale),
    });
  }

  /**
   * Tablo için optimize edilmiş format - 15 Oca
   */
  static forTable(date: string | Date, locale: $Enums.Locale = "TR"): string {
    return format(new Date(date), "d MMM", {
      locale: this.getLocale(locale),
    });
  }

  /**
   * Dashboard için optimize edilmiş - 15.01 14:30
   */
  static forDashboard(
    date: string | Date,
    locale: $Enums.Locale = "TR"
  ): string {
    return format(new Date(date), "dd.MM HH:mm", {
      locale: this.getLocale(locale),
    });
  }

  /**
   * Detaylı timestamp - 15 Ocak 2025, 14:30:45
   */
  static timestamp(date: string | Date, locale: $Enums.Locale = "TR"): string {
    return format(new Date(date), "d MMMM yyyy, HH:mm:ss", {
      locale: this.getLocale(locale),
    });
  }

  static parseIsoString(
    isoString: string | null,
    setToStartOfDay: boolean = false,
    setToEndOfDay: boolean = false
  ): Date | null {
    if (!isoString) return null;

    try {
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(isoString)) {
        const [day, month, year] = isoString.split("/").map(Number);

        if (setToStartOfDay) {
          return new Date(year, month - 1, day, 0, 0, 0, 0);
        }

        if (setToEndOfDay) {
          return new Date(year, month - 1, day, 23, 59, 59, 999);
        }

        return new Date(year, month - 1, day, 0, 0, 0, 0);
      }

      if (/^\d{4}-\d{2}-\d{2}$/.test(isoString)) {
        const [year, month, day] = isoString.split("-").map(Number);

        if (setToStartOfDay) {
          return new Date(year, month - 1, day, 0, 0, 0, 0);
        }

        if (setToEndOfDay) {
          return new Date(year, month - 1, day, 23, 59, 59, 999);
        }

        return new Date(year, month - 1, day, 0, 0, 0, 0);
      }

      const date = parseISO(isoString);
      if (isValid(date)) {
        if (setToStartOfDay) {
          date.setHours(0, 0, 0, 0);
        }
        if (setToEndOfDay) {
          date.setHours(23, 59, 59, 999);
        }
        return date;
      }

      return null;
    } catch (error) {
      console.error("Invalid date string:", isoString, error);
      return null;
    }
  }
}

function calculateEAN13CheckDigit(digits: string): string {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(digits[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit.toString();
}

/**
 * Rastgele sayı üretir
 */
function generateRandomNumber(length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

/**
 * Benzersiz SKU oluşturur
 * Format: [PRODUCT_PREFIX]-[TIMESTAMP]-[RANDOM]
 */
export function generateSKU(
  productName: string,
  options?: {
    prefix?: string;
    maxLength?: number;
    includeTimestamp?: boolean;
  }
): string {
  const {
    prefix = "",
    maxLength = 20,
    includeTimestamp = true,
  } = options || {};

  const productSlug = slugify(productName);
  const productPrefix = prefix || productSlug.substring(0, 6).toUpperCase();

  const timestamp = includeTimestamp ? Date.now().toString().slice(-6) : "";

  const randomPart = generateRandomNumber(4);

  let sku = [productPrefix, timestamp, randomPart]
    .filter((part) => part.length > 0)
    .join("-");

  if (sku.length > maxLength) {
    const prefixLength = Math.min(productPrefix.length, 4);
    const timestampLength = includeTimestamp ? 6 : 0;
    const randomLength = 4;
    const separatorLength = includeTimestamp ? 2 : 1;

    const availableLength =
      maxLength - timestampLength - randomLength - separatorLength;
    const trimmedPrefix = productPrefix.substring(
      0,
      Math.max(availableLength, 3)
    );

    sku = [trimmedPrefix, timestamp, randomPart]
      .filter((part) => part.length > 0)
      .join("-");
  }

  return sku;
}

/**
 * EAN-13 formatında barcode oluşturur
 * Format: 869XXXXXXXXX (Türkiye ülke kodu 869)
 */
export function generateEAN13Barcode(
  productName?: string,
  options?: {
    countryCode?: string;
    companyCode?: string;
  }
): string {
  const { countryCode = "869", companyCode = "" } = options || {};

  const country = countryCode.padStart(3, "0");

  let company = companyCode;
  if (!company) {
    company = generateRandomNumber(4);
  }
  company = company.substring(0, 5).padStart(4, "0");

  let productCode = "";
  if (productName) {
    let hash = 0;
    for (let i = 0; i < productName.length; i++) {
      const char = productName.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    productCode = Math.abs(hash).toString().substring(0, 5).padStart(5, "0");
  } else {
    productCode = generateRandomNumber(5);
  }

  const first12Digits = country + company + productCode;

  const barcode12 = first12Digits.substring(0, 12).padStart(12, "0");

  const checkDigit = calculateEAN13CheckDigit(barcode12);

  return barcode12 + checkDigit;
}

/**
 * Hem SKU hem barcode oluşturan ana fonksiyon
 */
export function generateProductCodes(
  productName: string,
  options?: {
    skuOptions?: Parameters<typeof generateSKU>[1];
    barcodeOptions?: Parameters<typeof generateEAN13Barcode>[1];
  }
) {
  const { skuOptions, barcodeOptions } = options || {};

  return {
    sku: generateSKU(productName, skuOptions),
    barcode: generateEAN13Barcode(productName, barcodeOptions),
  };
}

export const ProductPageSortOption = {
  NEWEST: "newest",
  OLDEST: "oldest",
  PRICE_DESC: "price-desc",
  PRICE_ASC: "price-asc",
  BEST_SELLING: "best-selling",
  A_Z: "a-z",
  Z_A: "z-a",
};

export type ProductPageSortOption =
  (typeof ProductPageSortOption)[keyof typeof ProductPageSortOption];

export function getSortProductPageLabel(sortOption: ProductPageSortOption) {
  switch (sortOption) {
    case ProductPageSortOption.NEWEST:
      return "En Yeni";
    case ProductPageSortOption.OLDEST:
      return "En Eski";
    case ProductPageSortOption.PRICE_DESC:
      return "Fiyat: Yüksekten Düşüğe";
    case ProductPageSortOption.PRICE_ASC:
      return "Fiyat: Düşükten Yükseğe";
    case ProductPageSortOption.BEST_SELLING:
      return "En Çok Satan";
    case ProductPageSortOption.A_Z:
      return "İsim: A'dan Z'ye";
    case ProductPageSortOption.Z_A:
      return "İsim: Z'den A'ya";
    default:
      return "En Yeni";
  }
}

export function getSortIndexFromQuery(index: number): ProductPageSortOption {
  switch (index) {
    case 0:
      return ProductPageSortOption.NEWEST;
    case 1:
      return ProductPageSortOption.OLDEST;
    case 2:
      return ProductPageSortOption.PRICE_DESC;
    case 3:
      return ProductPageSortOption.PRICE_ASC;
    case 4:
      return ProductPageSortOption.BEST_SELLING;
    case 5:
      return ProductPageSortOption.A_Z;
    case 6:
      return ProductPageSortOption.Z_A;
    default:
      return ProductPageSortOption.NEWEST;
  }
}

export function getIndexFromSortOption(
  sortOption: ProductPageSortOption
): number {
  switch (sortOption) {
    case ProductPageSortOption.NEWEST:
      return 0;
    case ProductPageSortOption.OLDEST:
      return 1;
    case ProductPageSortOption.PRICE_DESC:
      return 2;
    case ProductPageSortOption.PRICE_ASC:
      return 3;
    case ProductPageSortOption.BEST_SELLING:
      return 4;
    case ProductPageSortOption.A_Z:
      return 5;
    case ProductPageSortOption.Z_A:
      return 6;
    default:
      return 0;
  }
}

const ORDER_STATUS_CONFIG = {
  PENDING: {
    value: 1,
    label: "Beklemede",
    badgeColor: "yellow",
  },
  CONFIRMED: {
    value: 2,
    label: "Onaylandı",
    badgeColor: "blue",
  },
  PROCESSING: {
    value: 3,
    label: "İşleniyor",
    badgeColor: "cyan",
  },
  SHIPPED: {
    value: 4,
    label: "Kargolandı",
    badgeColor: "violet",
  },
  DELIVERED: {
    value: 5,
    label: "Teslim Edildi",
    badgeColor: "teal",
  },
  COMPLETED: {
    value: 6,
    label: "Tamamlandı",
    badgeColor: "green",
  },
  CANCELLED: {
    value: 7,
    label: "İptal Edildi",
    badgeColor: "red",
  },
  REFUNDED: {
    value: 8,
    label: "İade Edildi",
    badgeColor: "orange",
  },
  PARTIALLY_SHIPPED: {
    value: 9,
    label: "Kısmen Kargolandı",
    badgeColor: "indigo",
  },
  PARTIALLY_DELIVERED: {
    value: 10,
    label: "Kısmen Teslim Edildi",
    badgeColor: "lime",
  },
  PARTIALLY_REFUNDED: {
    value: 11,
    label: "Kısmen İade Edildi",
    badgeColor: "pink",
  },
} as Record<
  $Enums.OrderStatus,
  { value: number; label: string; badgeColor: string }
>;

export function getOrderStatusBadgeLabel(status: $Enums.OrderStatus): string {
  return ORDER_STATUS_CONFIG[status].label;
}

export function getOrderStatusBadgeColor(status: $Enums.OrderStatus): string {
  return ORDER_STATUS_CONFIG[status].badgeColor;
}

export function getOrderStatusBadge(status: $Enums.OrderStatus) {
  return {
    label: ORDER_STATUS_CONFIG[status].label,
    color: ORDER_STATUS_CONFIG[status].badgeColor,
  };
}

export function getOrderStatusLabel(status: $Enums.OrderStatus): string {
  return ORDER_STATUS_CONFIG[status].label;
}

export function convertIntToOrderStatus(status: number): $Enums.OrderStatus {
  const entry = Object.entries(ORDER_STATUS_CONFIG).find(
    ([_, config]) => config.value === status
  );
  return (entry?.[0] as $Enums.OrderStatus) ?? "PENDING";
}

export function convertOrderStatusToInt(status: $Enums.OrderStatus): number {
  return ORDER_STATUS_CONFIG[status]?.value ?? 1;
}

export function getOrderStatusOptions() {
  return Object.entries(ORDER_STATUS_CONFIG).map(([key, config]) => ({
    value: key as $Enums.OrderStatus,
    label: config.label,
    numericValue: config.value,
  }));
}

/**
 * Verilen 'Locale' (bölge/dil) bilgisine dayanarak sistemde kullanılması gereken
 * varsayılan 'Currency' (para birimi) kodunu döndürür.
 *
 * ### Kullanım Amacı
 * Bu fonksiyon, admin panelinden yönetilen "Hangi bölgede hangi para birimi gösterilsin?"
 * iş kuralını merkezi bir yerden uygular. Örneğin, 'EN' (İngilizce) locale'ine sahip
 * bir kullanıcının 'TRY' (Türk Lirası) cinsinden fiyat görmesini sağlar.
 *
 * Sepet birleştirme (`mergeCarts`) veya yeni sepet oluşturma (`createCart`) gibi
 * işlemlerde, sepetin para birimini kullanıcının mevcut locale'ine göre
 * doğru bir şekilde ayarlamak için kullanılır.
 *
 * @param locale Para birimi eşleşmesi aranacak olan locale kodu (örn: 'TR', 'EN').
 * @returns Eşleşen '$Enums.Currency' (örn: 'TRY', 'EUR'). Eşleşme bulunamazsa 'TRY' olarak fallback yapar.
 */
export const getDefaultCurrencyForLocale = (
  locale: $Enums.Locale
): $Enums.Currency => {
  const mapping: Record<$Enums.Locale, $Enums.Currency> = {
    TR: "TRY",
    EN: "TRY",
    DE: "EUR",
  };

  return mapping[locale] || "TRY";
};
const WhereAddedOptions: Record<
  $Enums.WhereAdded,
  { label: string; messageLabel: string }
> = {
  BRAND_PAGE: { label: "Marka Sayfası", messageLabel: "Marka sayfasından" },
  CATEGORY_PAGE: {
    label: "Kategori Sayfası",
    messageLabel: "Kategori sayfasından",
  },
  PRODUCT_PAGE: { label: "Ürün Sayfası", messageLabel: "Ürün sayfasından" },
  CART_PAGE: { label: "Sepet Sayfası", messageLabel: "Sepet sayfasından" },
};

export function getWhereAddedLabel(where: $Enums.WhereAdded): string {
  return WhereAddedOptions[where]?.label || "Bilinmeyen";
}
export function getWhereAddedMessageLabel(where: $Enums.WhereAdded): string {
  return WhereAddedOptions[where]?.messageLabel || "Bilinmeyen";
}

const cartActivityOptions: Record<$Enums.CartActivityType, { label: string }> =
  {
    BILLING_ADDRESS_SET: { label: "Fatura adresi ayarlandı" },
    SHIPPING_ADDRESS_SET: { label: "Teslimat adresi ayarlandı" },
    ITEM_ADDED: { label: "Ürün sepete eklendi" },
    ITEM_REMOVED: { label: "Ürün sepetten çıkarıldı" },
    ITEM_QUANTITY_CHANGED: { label: "Ürün miktarı güncellendi" },
    CART_MERGED: { label: "Sepet birleştirildi" },
    CART_CREATED: { label: "Yeni sepet oluşturuldu" },
    CART_STATUS_CHANGED: { label: "Sepet durumu değiştirildi" },
    ITEM_VISIBILITY_CHANGED: { label: "Ürün görünürlüğü değiştirildi" },
    PAYMENT_ATTEMPT_FAILED: { label: "Ödeme denemesi başarısız oldu" },
    PAYMENT_ATTEMPT_SUCCESS: { label: "Ödeme denemesi başarılı oldu" },
  };

export function getCartActivityLabel(
  activityType: $Enums.CartActivityType
): string {
  return cartActivityOptions[activityType]?.label || "Bilinmeyen";
}

const actorTypeConfigs: Record<
  $Enums.ActorType,
  {
    label: string;
  }
> = {
  ADMIN: { label: "Yönetici" },
  USER: { label: "Kullanıcı" },
  SYSTEM: { label: "Sistem" },
};

export function getActorTypeLabel(actorType: $Enums.ActorType): string {
  return actorTypeConfigs[actorType]?.label || "Bilinmeyen";
}

export const cartStatusConfigs: Record<
  $Enums.CartStatus,
  { logLabel: string; selectLabel: string; sortValue: number }
> = {
  ABANDONED: {
    logLabel: "Terkedilmiş",
    selectLabel: "Terkedilmiş Sepetler",
    sortValue: 1,
  },
  ACTIVE: { logLabel: "Aktif", selectLabel: "Aktif Sepetler", sortValue: 2 },
  CONVERTED: {
    logLabel: "Sipariş Oluşturulan",
    selectLabel: "Sipariş Oluşturulan Sepetler",
    sortValue: 3,
  },
  MERGED: {
    logLabel: "Birleştirilmiş",
    selectLabel: "Birleştirilmiş Sepetler",
    sortValue: 4,
  },
};

export function getCartStatusLogLabel(status: $Enums.CartStatus): string {
  return cartStatusConfigs[status]?.logLabel || "Bilinmeyen";
}

export function getCartStatusSelectLabel(status: $Enums.CartStatus): string {
  return cartStatusConfigs[status]?.selectLabel || "Bilinmeyen";
}

export function getCartStatusSortValue(status: $Enums.CartStatus): number {
  return cartStatusConfigs[status]?.sortValue || 99;
}

export function getCartStatusByValue(value: number): $Enums.CartStatus | null {
  const entry = Object.entries(cartStatusConfigs).find(
    ([_, config]) => config.sortValue === value
  );
  return (entry?.[0] as $Enums.CartStatus) || null;
}
