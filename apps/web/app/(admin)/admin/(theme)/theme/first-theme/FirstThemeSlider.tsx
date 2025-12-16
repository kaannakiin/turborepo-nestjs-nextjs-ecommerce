"use client";
import CustomCarousel, {
  SlideItem,
} from "@/components/carousels/CustomCarousel";
import CustomImage from "@/components/CustomImage";
import { useTheme } from "@/context/theme-context/ThemeContext";
import { getAspectRatioValue } from "@lib/helpers";
import { convertAssetToRenderImage } from "@lib/theme-helpers";
import { AspectRatio } from "@mantine/core";
import { AssetType } from "@repo/database";
import { SliderComponentOutputType } from "@repo/types";
import { useEffect, useMemo, useState } from "react";

interface FirstThemeSliderProps {
  data: SliderComponentOutputType;
}

const FirstThemeSlider = ({ data }: FirstThemeSliderProps) => {
  const { actualMedia: media } = useTheme();
  const { options } = data;

  const [assets, setAssets] = useState<Array<{
    url: string;
    alt?: string;
    type: AssetType;
  }> | null>([]);

  useEffect(() => {
    const convertedAssets = convertAssetToRenderImage(data.sliders, media);
    setAssets(convertedAssets);
  }, [media, data]);

  const activeAspectRatio = useMemo(() => {
    if (media === "mobile" && options.mobileAspectRatio) {
      return getAspectRatioValue(options.mobileAspectRatio);
    }
    return getAspectRatioValue(options.aspectRatio);
  }, [media, options]);

  const carouselSlides: SlideItem[] = useMemo(() => {
    if (!assets) return [];

    return assets.map((asset, index) => ({
      id: index,
      content: (
        <AspectRatio ratio={activeAspectRatio || 16 / 9} pos={"relative"}>
          {asset.type === "VIDEO" ? (
            <video
              src={asset.url}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <CustomImage src={asset.url} alt={asset.alt || "Banner Image"} />
          )}
        </AspectRatio>
      ),
    }));
  }, [assets, activeAspectRatio]);

  const autoplayConfig = useMemo(() => {
    if (!options.autoPlay) return false;
    return {
      delay: options.autoPlayInterval || 3000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    };
  }, [options.autoPlay, options.autoPlayInterval]);

  if (!carouselSlides || carouselSlides.length === 0) {
    return null;
  }

  return (
    <CustomCarousel
      slides={carouselSlides}
      slidesPerView={1}
      loop={options.loop}
      navigation={options.showArrows}
      pagination={options.showIndicators ? { clickable: true } : false}
      autoplay={autoplayConfig}
      effect="creative"
      creativeEffect={{
        prev: {
          shadow: true,
          translate: [0, 0, -400],
        },
        next: {
          translate: ["100%", 0, 0],
        },
      }}
    />
  );
};

export default FirstThemeSlider;
