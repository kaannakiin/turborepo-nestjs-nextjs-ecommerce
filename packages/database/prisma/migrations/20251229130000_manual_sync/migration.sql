-- Bu dosya Prisma senkronizasyonu icin olusturulmustur
ALTER TABLE "ProductTagTranslation"
ADD COLUMN IF NOT EXISTS "slug" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "ProductTagTranslation_locale_slug_key" ON "ProductTagTranslation" ("locale", "slug");