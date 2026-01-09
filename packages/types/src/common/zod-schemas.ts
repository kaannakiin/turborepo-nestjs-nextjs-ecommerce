import { AssetType } from "@repo/database/client";
import { parseDocument } from "htmlparser2";
import { z } from "zod";
/**
 * Asset tiplerine karşılık gelen MIME type'ları tanımlar.
 * Her asset tipi için izin verilen dosya formatlarının MIME type listesi.
 */
export const MIME_TYPES = {
  IMAGE: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    "image/avif",
  ] as string[],
  VIDEO: ["video/webm"] as string[],
  AUDIO: ["audio/mpeg", "audio/mp4"] as string[],
  DOCUMENT: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ] as string[],
} as Record<AssetType, string[]>;

/**
 * Belirtilen asset tipi için izin verilen MIME type'ları döndürür.
 *
 * @param type - Asset tipi
 * @returns MIME type dizisi veya tip bulunamazsa boş dizi
 *
 * @example
 * getMimeTypesForAssetType(AssetType.IMAGE)
 * // ["image/jpeg", "image/png", "image/webp", "image/gif"]
 */
export const getMimeTypesForAssetType = (type: AssetType): string[] => {
  return MIME_TYPES[type] || [];
};

export const getAssetTypeMessage = (types: AssetType[] | AssetType): string => {
  const typeArray = Array.isArray(types) ? types : [types];

  const messages = typeArray.map((type) => {
    switch (type) {
      case AssetType.IMAGE:
        return "resim dosyaları (JPEG, PNG, GIF, WebP, SVG)";
      case AssetType.VIDEO:
        return "video dosyaları (MP4, AVI, MOV, WebM)";
      case AssetType.AUDIO:
        return "ses dosyaları (MP3, WAV, AAC, FLAC)";
      case AssetType.DOCUMENT:
        return "döküman dosyaları (PDF, DOC, DOCX, XLS, XLSX, TXT)";
      default:
        return "desteklenen dosyalar";
    }
  });

  return messages.join(" veya ");
};

/**
 * Dosya yükleme için Zod validation şeması oluşturur.
 * Dosya boyutu, tipi ve içeriği için validasyon kuralları uygular.
 *
 * @param type - İzin verilen asset tipi veya tipleri
 * @param maxSize - Maksimum dosya boyutu (byte cinsinden, varsayılan: 10MB)
 * @returns Zod dosya validation şeması
 *
 * Validasyon kuralları:
 * - Dosya geçerli bir File instance'ı olmalı
 * - Dosya boş olmamalı (size > 0)
 * - Dosya boyutu maxSize'ı geçmemeli
 * - Dosya tipi belirtilen asset tiplerinden birine uygun olmalı
 *
 * @example
 * const imageSchema = FileSchema({ type: AssetType.IMAGE });
 * const multiTypeSchema = FileSchema({
 *   type: [AssetType.IMAGE, AssetType.VIDEO],
 *   maxSize: 5 * 1024 * 1024 // 5MB
 * });
 */
export const FileSchema = ({
  type,
  maxSize = 10 * 1024 * 1024,
}: {
  type: AssetType[] | AssetType;
  maxSize?: number;
}) => {
  const allowedTypes = Array.isArray(type) ? type : [type];
  const allowedMimeTypes = allowedTypes.flatMap(getMimeTypesForAssetType);

  return z
    .instanceof(File, {
      error: "Geçerli bir dosya yükleyiniz.",
    })
    .refine((file) => file.size > 0, {
      error: "Dosya boş olamaz.",
    })
    .refine((file) => file.size <= maxSize, {
      error: `Dosya boyutu en fazla ${maxSize / (1024 * 1024)} MB olabilir.`,
    })
    .refine((file) => allowedMimeTypes.includes(file.type), {
      error: `Sadece ${getAssetTypeMessage(allowedTypes)} yükleyebilirsiniz.`,
    });
};

export const htmlDescriptionSchema = z
  .string()
  .min(1, { error: "Açıklama zorunludur." })
  .max(10000, { error: "Açıklama en fazla 10.000 karakter olabilir." })
  .refine(
    (value) => {
      const dangerousTags =
        /<(script|iframe|object|embed|form|input|button|meta|link|style)/i;
      return !dangerousTags.test(value);
    },
    {
      error: "Güvenlik nedeniyle bazı HTML etiketlerine izin verilmez.",
    }
  )
  .refine(
    (value) => {
      try {
        parseDocument(value);
        return true;
      } catch {
        return false;
      }
    },
    { error: "HTML etiketleri düzgün kapatılmalıdır." }
  )
  .optional()
  .nullable();
export const colorHex = z
  .string({
    error: "Renk kodu zorunludur.",
  })
  .regex(/^#([A-Fa-f0-9]{6})$/, {
    error: "Geçersiz renk kodu. Hex formatında olmalıdır.",
  });

export const tcKimlikNoRegex = /^[1-9]{1}[0-9]{9}[02468]{1}$/;
