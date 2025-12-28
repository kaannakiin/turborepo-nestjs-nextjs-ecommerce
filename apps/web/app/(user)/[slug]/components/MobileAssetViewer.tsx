"use client";

import CustomImage from "@/components/CustomImage";
import { AspectRatio } from "@mantine/core";
import { AssetType } from "@repo/database";
import { useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";

interface Asset {
  url: string;
  type: AssetType;
}

interface MobileAssetViewerProps {
  assets: Asset[];
}

const MobileAssetViewer = ({ assets }: MobileAssetViewerProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

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
    <div className="relative">
      <Swiper
        modules={[Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        pagination={{
          clickable: true,
          bulletClass: "swiper-pagination-bullet !bg-gray-300 !opacity-100",
          bulletActiveClass: "!bg-black !w-4 !rounded-full",
        }}
        onSlideChange={(swiper: SwiperType) =>
          setActiveIndex(swiper.activeIndex)
        }
        className="rounded-lg overflow-hidden"
      >
        {assets.map((asset, index) => {
          const isVideo = asset.type === AssetType.VIDEO;

          return (
            <SwiperSlide key={index}>
              <AspectRatio ratio={1} className="relative">
                {isVideo ? (
                  <video
                    src={asset.url}
                    className="w-full h-full object-cover"
                    controls
                    muted
                    loop
                    playsInline
                    autoPlay={activeIndex === index}
                  />
                ) : (
                  <CustomImage
                    src={asset.url}
                    alt={`Ürün görseli ${index + 1}`}
                  />
                )}
              </AspectRatio>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default MobileAssetViewer;
