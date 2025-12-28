"use client";

import { ActionIcon, AspectRatio } from "@mantine/core";
import { AssetType } from "@repo/database";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconChevronDown,
  IconPlayerPlay,
} from "@tabler/icons-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import ProductImage from "./ProductImage";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";

interface Asset {
  url: string;
  type: AssetType;
}

interface DesktopAssetViewerProps {
  assets: Asset[];
}

const DesktopAssetViewer = ({ assets }: DesktopAssetViewerProps) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const mainSwiperRef = useRef<SwiperType | null>(null);

  if (assets.length === 0) {
    return (
      <AspectRatio ratio={1}>
        <div className="bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-gray-400">Görsel yok</span>
        </div>
      </AspectRatio>
    );
  }

  return (
    <div className="flex gap-4">
      {/* Thumbnails */}
      <div className="relative w-20 flex-shrink-0">
        <ActionIcon
          variant="white"
          radius="xl"
          size="md"
          onClick={() => thumbsSwiper?.slidePrev()}
          className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 shadow-md"
        >
          <IconChevronUp size={16} />
        </ActionIcon>

        <Swiper
          onSwiper={setThumbsSwiper}
          direction="vertical"
          spaceBetween={8}
          slidesPerView={6}
          watchSlidesProgress
          modules={[Thumbs]}
          className="h-[500px] py-8"
        >
          {assets.map((asset, index) => {
            const isAssetVideo = asset.type === AssetType.VIDEO;

            return (
              <SwiperSlide key={index} className="!h-auto">
                <button
                  onClick={() => {
                    setActiveIndex(index);
                    mainSwiperRef.current?.slideTo(index);
                  }}
                  className={`
                    relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-all
                    ${activeIndex === index ? "border-black" : "border-transparent hover:border-gray-300"}
                  `}
                >
                  {isAssetVideo ? (
                    <>
                      <video
                        src={asset.url}
                        className="w-full h-full object-cover"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <IconPlayerPlay
                          size={16}
                          className="text-white"
                          fill="white"
                        />
                      </div>
                    </>
                  ) : (
                    <Image
                      src={asset.url}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  )}
                </button>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <ActionIcon
          variant="white"
          radius="xl"
          size="md"
          onClick={() => thumbsSwiper?.slideNext()}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10 shadow-md"
        >
          <IconChevronDown size={16} />
        </ActionIcon>
      </div>

      {/* Main Image */}
      <div className="flex-1 relative min-w-0">
        <Swiper
          onSwiper={(swiper) => (mainSwiperRef.current = swiper)}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          thumbs={{
            swiper:
              thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          spaceBetween={0}
          slidesPerView={1}
          modules={[Thumbs, Navigation]}
          className="rounded-lg overflow-hidden"
        >
          {assets.map((asset, index) => {
            const isAssetVideo = asset.type === AssetType.VIDEO;

            return (
              <SwiperSlide key={index}>
                <AspectRatio
                  ratio={1}
                  className="relative overflow-hidden bg-gray-50"
                >
                  {isAssetVideo ? (
                    <video
                      src={asset.url}
                      className="w-full h-full object-cover"
                      controls
                      autoPlay={activeIndex === index}
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <ProductImage
                      src={asset.url}
                      alt={`Ürün görseli ${index + 1}`}
                      priority={index === 0}
                    />
                  )}
                </AspectRatio>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Navigation Buttons */}
        {assets.length > 1 && (
          <>
            <ActionIcon
              variant="white"
              radius="xl"
              size="lg"
              onClick={() => mainSwiperRef.current?.slidePrev()}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 shadow-md"
            >
              <IconChevronLeft size={20} />
            </ActionIcon>

            <ActionIcon
              variant="white"
              radius="xl"
              size="lg"
              onClick={() => mainSwiperRef.current?.slideNext()}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 shadow-md"
            >
              <IconChevronRight size={20} />
            </ActionIcon>
          </>
        )}
      </div>
    </div>
  );
};

export default DesktopAssetViewer;
