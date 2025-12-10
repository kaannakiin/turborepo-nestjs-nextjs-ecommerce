"use client";

import { useTheme } from "@/(admin)/admin/(theme)/ThemeContexts/ThemeContext";
import CustomImage from "@/components/CustomImage";
import { getAspectRatioValue } from "@lib/helpers";
import { AssetType } from "@repo/database";
import { SliderComponentInputType } from "@repo/types";
import { useEffect, useState } from "react";

import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import styles from "./modules/FirstThemeSlider.module.css";
interface FirstThemeSliderProps {
  data: SliderComponentInputType;
}

const getAssetType = (type: string): AssetType => {
  if (type.startsWith("image/")) return "IMAGE";
  if (type.startsWith("video/")) return "VIDEO";
  return "DOCUMENT";
};

const FirstThemeSlider = ({ data }: FirstThemeSliderProps) => {
  const { media } = useTheme();
  const { options } = data;

  const [sliderElements, setSliderElements] = useState<
    { url: string; type: AssetType }[]
  >([]);

  useEffect(() => {
    const processedElements = data.sliders
      .sort((a, b) => a.order - b.order)
      .filter((slider) => {
        const view = slider.desktopView;
        return view && (view.file || view.existingAsset);
      })
      .map((slider) => {
        const view = slider.desktopView;
        let url = "";
        let type: AssetType = "DOCUMENT";

        if (view.file) {
          url = URL.createObjectURL(view.file);
          type = getAssetType(view.file.type);
        } else if (view.existingAsset) {
          url = view.existingAsset.url;
          type = view.existingAsset.type as AssetType;
        }
        return { url, type };
      });

    setSliderElements(processedElements);

    return () => {
      processedElements.forEach((el) => {
        if (el.url.startsWith("blob:")) URL.revokeObjectURL(el.url);
      });
    };
  }, [media, data.sliders]);

  if (sliderElements.length === 0) return null;

  const isMobile = media === "mobile";
  const targetRatio =
    isMobile && options.mobileAspectRatio
      ? options.mobileAspectRatio
      : options.aspectRatio;

  const aspectRatioValue = getAspectRatioValue(targetRatio);

  return (
    <div
      className={styles.sliderContainer}
      style={{
        width: "100%",
        position: "relative",
        aspectRatio: aspectRatioValue,
      }}
    >
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        loop={options.loop}
        navigation={options.showArrows}
        pagination={
          options.showIndicators
            ? {
                clickable: true,

                type: "bullets",
              }
            : false
        }
        autoplay={
          options.autoPlay
            ? {
                delay: options.autoPlayInterval,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        className="w-full h-full"
      >
        {sliderElements.map((slide, index) => (
          <SwiperSlide key={index}>
            <div
              style={{ width: "100%", height: "100%", position: "relative" }}
            >
              {slide.type === "IMAGE" ? (
                <CustomImage
                  src={slide.url}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <video
                  src={slide.url}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  autoPlay={options.autoPlay}
                  muted
                  loop
                  playsInline
                />
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default FirstThemeSlider;
