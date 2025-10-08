import { OrderStatus, PaymentStatus } from "@repo/database";
import { format, formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

export function slugify(text: string): string {
  if (!text || typeof text !== "string") return "";

  const turkishCharMap: Record<string, string> = {
    ç: "c",
    Ç: "C",
    ğ: "g",
    Ğ: "G",
    ı: "i",
    I: "I",
    İ: "i", // Büyük İ'yi küçük i yap
    ö: "o",
    Ö: "O",
    ş: "s",
    Ş: "S",
    ü: "u",
    Ü: "U",
  };

  // Önce Türkçe karakterleri dönüştür
  let result = text.trim();
  for (const [turkish, latin] of Object.entries(turkishCharMap)) {
    result = result.replaceAll(turkish, latin);
  }

  return result
    .toLowerCase()
    .replace(/\s+/g, "-") // Boşlukları tire yap
    .replace(/[^a-z0-9-]/g, "") // Sadece harf, rakam, tire bırak
    .replace(/-+/g, "-") // Çoklu tireleri tek tire yap
    .replace(/^-+|-+$/g, "") // Başta/sondaki tireleri kaldır
    .substring(0, 100);
}

export class DateFormatter {
  private static locale = tr;

  /**
   * Sadece tarih - 15 Oca 2025
   */
  static withDay(date: string | Date): string {
    return format(new Date(date), "d MMM yyyy", { locale: this.locale });
  }

  /**
   * Tarih ve saat - 15 Oca 2025, 14:30
   */
  static withTime(date: string | Date): string {
    return format(new Date(date), "d MMM yyyy, HH:mm", { locale: this.locale });
  }

  /**
   * Uzun tarih formatı - 15 Ocak 2025 Çarşamba
   */
  static withFullDay(date: string | Date): string {
    return format(new Date(date), "d MMMM yyyy EEEE", { locale: this.locale });
  }

  /**
   * Sadece saat - 14:30
   */
  static onlyTime(date: string | Date): string {
    return format(new Date(date), "HH:mm", { locale: this.locale });
  }

  /**
   * Kısa tarih - 15.01.2025
   */
  static shortDate(date: string | Date): string {
    return format(new Date(date), "dd.MM.yyyy", { locale: this.locale });
  }

  /**
   * Kısa tarih ve saat - 15.01.2025 14:30
   */
  static shortDateTime(date: string | Date): string {
    return format(new Date(date), "dd.MM.yyyy HH:mm", { locale: this.locale });
  }

  /**
   * Göreceli zaman - 2 saat önce, 3 gün önce
   */
  static relative(date: string | Date): string {
    return formatDistanceToNow(new Date(date), {
      locale: this.locale,
      addSuffix: true,
    });
  }

  /**
   * Ay ve yıl - Ocak 2025
   */
  static monthYear(date: string | Date): string {
    return format(new Date(date), "MMMM yyyy", { locale: this.locale });
  }

  /**
   * Sadece gün adı - Çarşamba
   */
  static dayName(date: string | Date): string {
    return format(new Date(date), "EEEE", { locale: this.locale });
  }

  /**
   * Tablo için optimize edilmiş format - 15 Oca
   */
  static forTable(date: string | Date): string {
    return format(new Date(date), "d MMM", { locale: this.locale });
  }

  /**
   * Dashboard için optimize edilmiş - 15.01 14:30
   */
  static forDashboard(date: string | Date): string {
    return format(new Date(date), "dd.MM HH:mm", { locale: this.locale });
  }

  /**
   * Detaylı timestamp - 15 Ocak 2025, 14:30:45
   */
  static timestamp(date: string | Date): string {
    return format(new Date(date), "d MMMM yyyy, HH:mm:ss", {
      locale: this.locale,
    });
  }
}
/**
 * EAN-13 barcode için check digit hesaplar
 */
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

  // Ürün adından prefix oluştur (mevcut slugify fonksiyonunu kullan)
  const productSlug = slugify(productName);
  const productPrefix = prefix || productSlug.substring(0, 6).toUpperCase();

  // Timestamp (son 6 hanesi)
  const timestamp = includeTimestamp ? Date.now().toString().slice(-6) : "";

  // Rastgele 4 haneli sayı
  const randomPart = generateRandomNumber(4);

  // SKU'yu birleştir
  let sku = [productPrefix, timestamp, randomPart]
    .filter((part) => part.length > 0)
    .join("-");

  // Maksimum uzunluk kontrolü
  if (sku.length > maxLength) {
    const prefixLength = Math.min(productPrefix.length, 4);
    const timestampLength = includeTimestamp ? 6 : 0;
    const randomLength = 4;
    const separatorLength = includeTimestamp ? 2 : 1; // Tire sayısı

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
  const {
    countryCode = "869", // Türkiye
    companyCode = "",
  } = options || {};

  // Ülke kodu (3 hane)
  const country = countryCode.padStart(3, "0");

  // Şirket kodu (4-5 hane) - eğer belirtilmemişse rastgele oluştur
  let company = companyCode;
  if (!company) {
    company = generateRandomNumber(4);
  }
  company = company.substring(0, 5).padStart(4, "0");

  // Ürün kodu (4-5 hane) - ürün adından hash veya rastgele
  let productCode = "";
  if (productName) {
    // Ürün adından basit hash oluştur
    let hash = 0;
    for (let i = 0; i < productName.length; i++) {
      const char = productName.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 32bit integer'a çevir
    }
    productCode = Math.abs(hash).toString().substring(0, 5).padStart(5, "0");
  } else {
    productCode = generateRandomNumber(5);
  }

  // İlk 12 haneyi birleştir
  const first12Digits = country + company + productCode;

  // 12 hane olacak şekilde ayarla
  const barcode12 = first12Digits.substring(0, 12).padStart(12, "0");

  // Check digit hesapla
  const checkDigit = calculateEAN13CheckDigit(barcode12);

  // Final barcode
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

export enum ProductPageSortOption {
  NEWEST = "newest",
  OLDEST = "oldest",
  PRICE_DESC = "price-desc", // Azalan fiyat
  PRICE_ASC = "price-asc", // Artan fiyat
  BEST_SELLING = "best-selling", // En çok satan
  A_Z = "a-z", // İsim A'dan Z'ye
  Z_A = "z-a", // İsim Z'den A'ya
}
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

export function getOrderStatusInt(status: OrderStatus): number {
  switch (status) {
    case "DELIVERED":
      return 1;
    case "SHIPPED":
      return 2;
    case "PROCESSING":
      return 3;
    case "PENDING":
      return 4;
    case "CANCELLED":
      return 5;
    case "CONFIRMED":
      return 6;
    case "REFUNDED":
      return 7;
  }
}

export function getOrderStatusFromInt(status: number): OrderStatus {
  switch (status) {
    case 1:
      return "DELIVERED";
    case 2:
      return "SHIPPED";
    case 3:
      return "PROCESSING";
    case 4:
      return "PENDING";
    case 5:
      return "CANCELLED";
    case 6:
      return "CONFIRMED";
    case 7:
      return "REFUNDED";
    default:
      return "CONFIRMED";
  }
}

export function getPaymentStatusInt(status: PaymentStatus): number {
  switch (status) {
    case "FAILED":
      return 1;
    case "PAID":
      return 2;
    case "PARTIAL_REFUND":
      return 3;
    case "PENDING":
      return 4;
    case "REFUNDED":
      return 5;
  }
}

export function getPaymentStatusFromInt(status: number): PaymentStatus {
  switch (status) {
    case 1:
      return "FAILED";
    case 2:
      return "PAID";
    case 3:
      return "PARTIAL_REFUND";
    case 4:
      return "PENDING";
    case 5:
      return "REFUNDED";
    default:
      return "PENDING";
  }
}
