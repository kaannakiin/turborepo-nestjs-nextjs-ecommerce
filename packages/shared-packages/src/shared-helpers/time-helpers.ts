import { Locale } from "@repo/database";
import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";
import { de, enUS, tr } from "date-fns/locale";
export class DateFormatter {
  /**
   * Locale'e göre date-fns locale objesini döndür
   */
  private static getLocale(locale: Locale) {
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
  static withDay(date: string | Date, locale: Locale = "TR"): string {
    return format(new Date(date), "d MMM yyyy", {
      locale: this.getLocale(locale),
    });
  }

  /**
   * Tarih ve saat - 15 Oca 2025, 14:30
   */
  static withTime(date: string | Date, locale: Locale = "TR"): string {
    return format(new Date(date), "d MMM yyyy, HH:mm", {
      locale: this.getLocale(locale),
    });
  }

  /**
   * Uzun tarih formatı - 15 Ocak 2025 Çarşamba
   */
  static withFullDay(date: string | Date, locale: Locale = "TR"): string {
    return format(new Date(date), "d MMMM yyyy EEEE", {
      locale: this.getLocale(locale),
    });
  }

  /**
   * Sadece saat - 14:30
   */
  static onlyTime(date: string | Date, locale: Locale = "TR"): string {
    return format(new Date(date), "HH:mm", {
      locale: this.getLocale(locale),
    });
  }

  /**
   * Kısa tarih - 15.01.2025
   */
  static shortDate(date: string | Date, locale: Locale = "TR"): string {
    return format(new Date(date), "dd.MM.yyyy", {
      locale: this.getLocale(locale),
    });
  }

  /**
   * Kısa tarih ve saat - 15.01.2025 14:30
   */
  static shortDateTime(date: string | Date, locale: Locale = "TR"): string {
    return format(new Date(date), "dd.MM.yyyy HH:mm", {
      locale: this.getLocale(locale),
    });
  }

  /**
   * Göreceli zaman - 2 saat önce, 3 gün önce
   */
  static relative(date: string | Date, locale: Locale = "TR"): string {
    return formatDistanceToNow(new Date(date), {
      locale: this.getLocale(locale),
      addSuffix: true,
    });
  }

  /**
   * Ay ve yıl - Ocak 2025
   */
  static monthYear(date: string | Date, locale: Locale = "TR"): string {
    return format(new Date(date), "MMMM yyyy", {
      locale: this.getLocale(locale),
    });
  }

  /**
   * Sadece gün adı - Çarşamba
   */
  static dayName(date: string | Date, locale: Locale = "TR"): string {
    return format(new Date(date), "EEEE", {
      locale: this.getLocale(locale),
    });
  }

  /**
   * Tablo için optimize edilmiş format - 15 Oca
   */
  static forTable(date: string | Date, locale: Locale = "TR"): string {
    return format(new Date(date), "d MMM", {
      locale: this.getLocale(locale),
    });
  }

  /**
   * Dashboard için optimize edilmiş - 15.01 14:30
   */
  static forDashboard(date: string | Date, locale: Locale = "TR"): string {
    return format(new Date(date), "dd.MM HH:mm", {
      locale: this.getLocale(locale),
    });
  }

  /**
   * Detaylı timestamp - 15 Ocak 2025, 14:30:45
   */
  static timestamp(date: string | Date, locale: Locale = "TR"): string {
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
  static toISOString(date: string | Date | null): string | null {
    if (!date) return null;

    let dateObj: Date | null;

    if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = this.parseIsoString(date);
    }

    if (dateObj && isValid(dateObj)) {
      return dateObj.toISOString();
    }

    return null;
  }
}
