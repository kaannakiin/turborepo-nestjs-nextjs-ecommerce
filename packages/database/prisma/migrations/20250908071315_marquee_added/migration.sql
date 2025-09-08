-- CreateEnum
CREATE TYPE "public"."YAXISDIRECTION" AS ENUM ('HORIZONTAL', 'VERTICAL');

-- CreateEnum
CREATE TYPE "public"."XAXISDIRECTION" AS ENUM ('LTR', 'RTL');

-- CreateTable
CREATE TABLE "public"."MarqueeItemSchema" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "options" JSONB,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "locale" "public"."Locale"[],
    "marqueeSchemaId" TEXT NOT NULL,

    CONSTRAINT "MarqueeItemSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MarqueeSchema" (
    "id" TEXT NOT NULL,
    "xaxisDirection" "public"."XAXISDIRECTION" NOT NULL DEFAULT 'LTR',
    "yaxisDirection" "public"."YAXISDIRECTION" NOT NULL DEFAULT 'HORIZONTAL',
    "pauseOnHover" BOOLEAN NOT NULL DEFAULT false,
    "duration" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarqueeSchema_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarqueeItemSchema_marqueeSchemaId_order_key" ON "public"."MarqueeItemSchema"("marqueeSchemaId", "order");

-- AddForeignKey
ALTER TABLE "public"."MarqueeItemSchema" ADD CONSTRAINT "MarqueeItemSchema_marqueeSchemaId_fkey" FOREIGN KEY ("marqueeSchemaId") REFERENCES "public"."MarqueeSchema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
