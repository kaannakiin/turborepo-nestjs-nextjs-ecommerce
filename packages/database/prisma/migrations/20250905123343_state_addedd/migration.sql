-- CreateTable
CREATE TABLE "public"."StateTranslation" (
    "id" TEXT NOT NULL,
    "locale" "public"."Locale" NOT NULL DEFAULT 'TR',
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stateId" TEXT NOT NULL,

    CONSTRAINT "StateTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."State" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stateCode" TEXT,
    "countryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StateTranslation_locale_stateId_key" ON "public"."StateTranslation"("locale", "stateId");

-- AddForeignKey
ALTER TABLE "public"."StateTranslation" ADD CONSTRAINT "StateTranslation_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "public"."State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."State" ADD CONSTRAINT "State_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "public"."Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
