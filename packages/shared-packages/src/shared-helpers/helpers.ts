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
