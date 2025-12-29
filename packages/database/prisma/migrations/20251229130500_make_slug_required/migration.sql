-- 1. Adım: Önce içerideki NULL olan slug'ları geçici bir şeyle doldur (Hata almamak için)
-- Eğer tablon boşsa bu satır bir şey değiştirmez, zararı yok.
UPDATE "ProductTagTranslation"
SET
    "slug" = 'temp-slug-' || "locale"
WHERE
    "slug" IS NULL;

-- 2. Adım: Artık hepsi dolu olduğuna göre kolonu ZORUNLU (NOT NULL) yap
ALTER TABLE "ProductTagTranslation"
ALTER COLUMN "slug"
SET
    NOT NULL;