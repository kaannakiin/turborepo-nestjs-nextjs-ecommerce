-- CreateEnum
CREATE TYPE "public"."LayoutComponentType" AS ENUM ('MARQUEE', 'SLIDER');

-- CreateTable
CREATE TABLE "public"."LayoutComponent" (
    "id" TEXT NOT NULL,
    "type" "public"."LayoutComponentType" NOT NULL,
    "order" INTEGER NOT NULL,
    "layoutId" TEXT NOT NULL,
    "sliderId" TEXT,
    "marqueeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LayoutComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Layout" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Layout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LayoutComponent_layoutId_order_key" ON "public"."LayoutComponent"("layoutId", "order");

-- AddForeignKey
ALTER TABLE "public"."LayoutComponent" ADD CONSTRAINT "LayoutComponent_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "public"."Layout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LayoutComponent" ADD CONSTRAINT "LayoutComponent_sliderId_fkey" FOREIGN KEY ("sliderId") REFERENCES "public"."SliderSchema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LayoutComponent" ADD CONSTRAINT "LayoutComponent_marqueeId_fkey" FOREIGN KEY ("marqueeId") REFERENCES "public"."MarqueeSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;
