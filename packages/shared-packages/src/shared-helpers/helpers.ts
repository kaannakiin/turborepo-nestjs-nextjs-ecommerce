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
