"use client";

import { ActionIcon, AspectRatio } from "@mantine/core";
import { AssetType } from "@repo/database/client";
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { Activity, useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import CustomImage from "@/components/CustomImage";
import "swiper/css";
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
  const thumbsSwiperRef = useRef<SwiperType | null>(null);

  if (assets.length === 0) {
    return (
      <AspectRatio ratio={1}>
        <div className="bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-gray-400">Görsel yok</span>
        </div>
      </AspectRatio>
    );
  }

  const handleThumbClick = (index: number) => {
    setActiveIndex(index);
    mainSwiperRef.current?.slideTo(index);
  };

  const handlePrev = () => {
    const newIndex = activeIndex === 0 ? assets.length - 1 : activeIndex - 1;
    setActiveIndex(newIndex);
    mainSwiperRef.current?.slideTo(newIndex);

    // Thumb swiper'ı da scroll et (visible range içinde olması için)
    if (thumbsSwiperRef.current) {
      const swiper = thumbsSwiperRef.current;
      // Eğer yeni index swiper'ın görünür alanının dışındaysa scroll et
      if (newIndex < swiper.activeIndex || newIndex >= swiper.activeIndex + 4) {
        swiper.slideTo(Math.max(0, newIndex - 1));
      }
    }
  };

  const handleNext = () => {
    const newIndex = activeIndex === assets.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(newIndex);
    mainSwiperRef.current?.slideTo(newIndex);

    // Thumb swiper'ı da scroll et
    if (thumbsSwiperRef.current) {
      const swiper = thumbsSwiperRef.current;
      if (newIndex < swiper.activeIndex || newIndex >= swiper.activeIndex + 4) {
        swiper.slideTo(Math.max(0, newIndex - 1));
      }
    }
  };

  return (
    <div className="flex gap-4 h-[500px]">
      <div className="relative w-28 flex-shrink-0">
        <Swiper
          onSwiper={(swiper) => {
            setThumbsSwiper(swiper);
            thumbsSwiperRef.current = swiper;
          }}
          direction="vertical"
          spaceBetween={12}
          slidesPerView="auto"
          watchSlidesProgress={true}
          modules={[Thumbs]}
          className="h-full"
        >
          {assets.map((asset, index) => {
            const isAssetVideo = asset.type === AssetType.VIDEO;

            return (
              <SwiperSlide
                key={index}
                style={{ height: "112px", width: "112px" }}
              >
                <button
                  onClick={() => handleThumbClick(index)}
                  className={`
                    relative w-full h-full block rounded-lg overflow-hidden border-2 transition-all
                    ${activeIndex === index ? "border-black" : "border-gray-200 hover:border-gray-400"}
                  `}
                >
                  <AspectRatio ratio={1} className="w-full h-full">
                    {isAssetVideo ? (
                      <div className="relative w-full h-full">
                        <video
                          src={asset.url}
                          className="w-full h-full object-cover"
                          muted
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                          <IconPlayerPlay
                            size={20}
                            className="text-white"
                            fill="white"
                          />
                        </div>
                      </div>
                    ) : (
                      <CustomImage src={asset.url} />
                    )}
                  </AspectRatio>
                </button>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      <div className="flex-1 relative min-w-0 h-full">
        <Swiper
          onSwiper={(swiper) => (mainSwiperRef.current = swiper)}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.realIndex);
          }}
          thumbs={{
            swiper:
              thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          spaceBetween={0}
          slidesPerView={1}
          modules={[Thumbs]}
          className="rounded-lg overflow-hidden h-full w-full"
        >
          {assets.map((asset, index) => {
            const isAssetVideo = asset.type === AssetType.VIDEO;

            return (
              <SwiperSlide key={index} className="h-full w-full">
                <div className="relative w-full h-full">
                  <Activity mode={isAssetVideo ? "visible" : "hidden"}>
                    <video
                      key={`video-${index}`}
                      src={asset.url}
                      className="w-full h-full object-contain"
                      controls
                      autoPlay={activeIndex === index}
                      muted
                      loop
                      playsInline
                    />
                  </Activity>
                  <Activity mode={!isAssetVideo ? "visible" : "hidden"}>
                    <div className="relative w-full h-full">
                      <CustomImage
                        src={asset.url}
                        alt={`Ürün görseli ${index + 1}`}
                      />
                    </div>
                  </Activity>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <Activity mode={assets?.length > 1 ? "visible" : "hidden"}>
          <div className="absolute bottom-4 right-4 z-10 flex gap-2">
            <ActionIcon
              variant="default"
              radius="xl"
              size="lg"
              className="shadow-md bg-white border-gray-200"
              onClick={handlePrev}
            >
              <IconChevronLeft size={20} />
            </ActionIcon>

            <ActionIcon
              variant="default"
              radius="xl"
              size="lg"
              className="shadow-md bg-white border-gray-200"
              onClick={handleNext}
            >
              <IconChevronRight size={20} />
            </ActionIcon>
          </div>
        </Activity>
      </div>
    </div>
  );
};

export default DesktopAssetViewer;
