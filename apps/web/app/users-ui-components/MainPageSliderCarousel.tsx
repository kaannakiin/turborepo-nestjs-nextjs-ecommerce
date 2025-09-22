"use client";
import { Carousel } from "@mantine/carousel";
import { AspectRatio, Box } from "@mantine/core";
import { SliderWithOrderType } from "@repo/types";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useTheme } from "../(admin)/admin/(theme)/ThemeContexts/ThemeContext";
import CustomImage from "../components/CustomImage";

interface MainPageSliderProps {
  data: SliderWithOrderType[];
}

const MainPageSliderCarousel = ({ data }: MainPageSliderProps) => {
  const { media } = useTheme();

  if (!data || data.length === 0) {
    return null;
  }

  const aspectRatio = media === "mobile" ? 1 : 1900 / 800;

  const getAssetInfo = (slider: SliderWithOrderType) => {
    if (media === "mobile") {
      if (slider.mobileAsset) {
        return {
          src: URL.createObjectURL(slider.mobileAsset),
          type: slider.mobileAsset.type.startsWith("video/")
            ? "VIDEO"
            : "IMAGE",
        };
      } else if (slider.existingMobileAsset) {
        return {
          src: slider.existingMobileAsset.url,
          type: slider.existingMobileAsset.type,
        };
      }
    }

    if (slider.desktopAsset) {
      return {
        src: URL.createObjectURL(slider.desktopAsset),
        type: slider.desktopAsset.type.startsWith("video/") ? "VIDEO" : "IMAGE",
      };
    } else if (slider.existingDesktopAsset) {
      return {
        src: slider.existingDesktopAsset.url,
        type: slider.existingDesktopAsset.type,
      };
    }

    return null;
  };

  const getControlStyles = () => {
    if (media === "mobile") {
      return {
        iconSize: 18,
        controlClass:
          "rounded-none p-2 border-[var(--mantine-primary-color-5)] border-2 hover:bg-[var(--mantine-primary-color-9)] [&>svg]:text-[var(--mantine-primary-color-9)] hover:[&>svg]:text-white bg-transparent transition-colors text-xs",
      };
    }
    return {
      iconSize: 24,
      controlClass:
        "rounded-none p-3 border-[var(--mantine-primary-color-5)] border-2 hover:bg-[var(--mantine-primary-color-9)] [&>svg]:text-[var(--mantine-primary-color-9)] hover:[&>svg]:text-white bg-transparent transition-colors",
    };
  };

  const { iconSize, controlClass } = getControlStyles();

  return (
    <Carousel
      className="w-full"
      slideSize={"100%"}
      slideGap={0}
      emblaOptions={{
        loop: true,
      }}
      previousControlIcon={<IconChevronLeft size={iconSize} />}
      nextControlIcon={<IconChevronRight size={iconSize} />}
      withIndicators={false}
      classNames={{
        control: controlClass,
      }}
    >
      {data
        .sort((a, b) => a.order - b.order)
        .map((slider) => {
          const assetInfo = getAssetInfo(slider);

          if (!assetInfo) {
            return null;
          }

          return (
            <Carousel.Slide className="w-full" key={slider.uniqueId}>
              <AspectRatio
                ratio={aspectRatio}
                className="w-full relative group"
              >
                {assetInfo.type === "VIDEO" ? (
                  <Box className="w-full h-full">
                    <video
                      src={assetInfo.src}
                      className="w-full h-full object-contain"
                      autoPlay
                      muted
                      loop
                      playsInline
                    >
                      Tarayıcınız video elementini desteklemiyor.
                    </video>
                  </Box>
                ) : (
                  <CustomImage
                    src={assetInfo.src}
                    alt={`Slider ${slider.order}`}
                  />
                )}

                {slider.customLink && (
                  <a
                    href={slider.customLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-10"
                    aria-label={`Slider ${slider.order} linki`}
                  />
                )}
              </AspectRatio>
            </Carousel.Slide>
          );
        })
        .filter(Boolean)}
    </Carousel>
  );
};

export default MainPageSliderCarousel;
