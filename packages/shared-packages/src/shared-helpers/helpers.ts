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
