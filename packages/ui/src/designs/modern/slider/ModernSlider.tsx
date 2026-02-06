"use client";

import {
  Box,
  Button,
  Title,
  Text,
  useMantineTheme,
  AspectRatio,
} from "@mantine/core";
import {
  SliderPreviewProps,
  Media,
  DesignSliderSchemaInputType,
} from "@repo/types";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useCallback, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { Image } from "../../../common/index";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { getAspectRatioValue } from "../../../lib/type-helpers";

export default function ModernSlider({ data, media }: SliderPreviewProps) {
  const theme = useMantineTheme();
  const swiperRef = useRef<SwiperType | null>(null);

  const primaryColor = theme.colors[theme.primaryColor][6];
  const primaryColorLight = theme.colors[theme.primaryColor][1];

  const handlePrev = useCallback(() => {
    swiperRef.current?.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    swiperRef.current?.slideNext();
  }, []);

  const getMediaInfo = (
    slide: DesignSliderSchemaInputType["slides"][number],
    currentMedia?: Media,
  ): { url: string; type: "IMAGE" | "VIDEO" } | null => {
    if (currentMedia === Media.MOBILE) {
      if (slide.mobileExistingAsset?.url && slide.mobileExistingAsset?.type) {
        return {
          url: slide.mobileExistingAsset.url,
          type: slide.mobileExistingAsset.type as "IMAGE" | "VIDEO",
        };
      }
      if (slide.mobileAsset instanceof File) {
        return {
          url: URL.createObjectURL(slide.mobileAsset),
          type: "IMAGE",
        };
      }
    }

    if (slide.existingAsset?.url && slide.existingAsset?.type) {
      return {
        url: slide.existingAsset.url,
        type: slide.existingAsset.type as "IMAGE" | "VIDEO",
      };
    }
    if (slide.image instanceof File) {
      return {
        url: URL.createObjectURL(slide.image),
        type: "IMAGE",
      };
    }
    return null;
  };

  if (!data.slides || data.slides.length === 0) {
    return (
      <Box
        style={{
          height: "100%",
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--mantine-color-gray-1)",
          borderRadius: "var(--mantine-radius-md)",
        }}
      >
        <Text c="dimmed">Slayt eklenmedi</Text>
      </Box>
    );
  }

  const currentAspectRatio =
    media === Media.MOBILE
      ? data.mobileAspectRatio || data.aspectRatio
      : data.aspectRatio;

  return (
    <Box
      style={{ position: "relative" }}
      component={AspectRatio}
      ratio={getAspectRatioValue(currentAspectRatio)}
    >
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        autoplay={
          data.autoplay
            ? {
                delay: data.autoplayInterval || 5000,
                disableOnInteraction: false,
              }
            : false
        }
        pagination={
          data.showDots
            ? {
                clickable: true,
                bulletClass: "swiper-pagination-bullet modern-slider-bullet",
                bulletActiveClass:
                  "swiper-pagination-bullet-active modern-slider-bullet-active",
              }
            : false
        }
        loop={data.slides.length > 1}
        style={{ overflow: "hidden" }}
      >
        {data.slides.map((slide) => {
          const slideMedia = getMediaInfo(slide, media);

          return (
            <SwiperSlide key={slide.uniqueId}>
              <Box
                style={{
                  position: "relative",
                  height: "100%",
                  backgroundColor: "var(--mantine-color-gray-2)",
                  overflow: "hidden",
                }}
              >
                {slideMedia && slideMedia.type === "IMAGE" && (
                  <Image
                    src={slideMedia.url}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}
                {slideMedia && slideMedia.type === "VIDEO" && (
                  <video
                    src={slideMedia.url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}
                {slide.withOverlay && (
                  <Box
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 60%)",
                    }}
                  />
                )}

                <Box
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "var(--mantine-spacing-xl)",
                    color: "#fff",
                  }}
                >
                  {slide.title && (
                    <Title
                      order={2}
                      style={{
                        color: slide.titleColor || "#fff",
                        marginBottom: "var(--mantine-spacing-xs)",
                        textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                      }}
                    >
                      {slide.title}
                    </Title>
                  )}

                  {slide.subtitle && (
                    <Text
                      size="lg"
                      style={{
                        color: slide.subtitleColor || "rgba(255,255,255,0.9)",
                        marginBottom: "var(--mantine-spacing-md)",
                        textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                      }}
                    >
                      {slide.subtitle}
                    </Text>
                  )}

                  {slide.buttonText && (
                    <Button
                      component="a"
                      href={slide.buttonLink || "#"}
                      size="md"
                      style={{
                        backgroundColor: slide.buttonColor || primaryColor,
                        color: slide.buttonTextColor || "#fff",
                      }}
                    >
                      {slide.buttonText}
                    </Button>
                  )}
                </Box>
              </Box>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {data.showArrows && data.slides.length > 1 && (
        <>
          <Box
            onClick={handlePrev}
            style={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              width: 44,
              height: 44,
              borderRadius: "50%",
              backgroundColor: primaryColorLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            <IconChevronLeft size={24} color={primaryColor} />
          </Box>
          <Box
            onClick={handleNext}
            style={{
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              width: 44,
              height: 44,
              borderRadius: "50%",
              backgroundColor: primaryColorLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            <IconChevronRight size={24} color={primaryColor} />
          </Box>
        </>
      )}

      <style>{`
        .modern-slider-bullet {
          width: 10px;
          height: 10px;
          background: rgba(255, 255, 255, 0.5);
          opacity: 1;
          transition: all 0.3s ease;
        }
        .modern-slider-bullet-active {
          background: ${primaryColor};
          width: 24px;
          border-radius: 5px;
        }
      `}</style>
    </Box>
  );
}
