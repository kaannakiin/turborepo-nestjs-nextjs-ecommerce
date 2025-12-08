"use client";

import {
  Media,
  useTheme,
} from "@/(admin)/admin/(theme)/ThemeContexts/ThemeContext";
import CustomImage from "@/components/CustomImage";
import { getAspectRatioValue } from "@lib/helpers";
import { Carousel } from "@mantine/carousel";
import { AspectRatio, Box, Center, Stack, Text } from "@mantine/core";
import {
  AspectRatio as AspectRatioType,
  SlideOutputType,
  SliderComponentOutputType,
} from "@repo/types";
import {
  IconChevronLeft,
  IconChevronRight,
  IconPhoto,
  IconVideoOff,
} from "@tabler/icons-react";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useRef, useState } from "react";
import Fade from "embla-carousel-fade";
interface SlideRendererProps {
  slide: SlideOutputType;
  media: Media;
  aspectRatio: AspectRatioType;
}

const SlideRenderer = ({ slide, media, aspectRatio }: SlideRendererProps) => {
  const [asset, setAsset] = useState<{ url: string; type: string } | null>(
    null
  );

  useEffect(() => {
    let objectUrl: string | null = null;

    const hasData = (
      view: SlideOutputType["desktopView"] | null | undefined
    ): boolean => {
      return !!(view && (view.file || view.existingAsset));
    };

    let currentView: SlideOutputType["desktopView"] | null | undefined = null;

    if (media === "mobile") {
      if (hasData(slide.mobileView)) {
        currentView = slide.mobileView;
      } else if (hasData(slide.desktopView)) {
        currentView = slide.desktopView;
      }
    } else {
      if (hasData(slide.desktopView)) {
        currentView = slide.desktopView;
      }
    }

    if (!currentView) {
      setAsset(null);
      return;
    }

    if (currentView.file) {
      const file = currentView.file as File;
      const assetType = file.type.startsWith("image/")
        ? "IMAGE"
        : file.type.startsWith("video/")
          ? "VIDEO"
          : null;

      if (assetType) {
        objectUrl = URL.createObjectURL(file);
        setAsset({ url: objectUrl, type: assetType });
      } else {
        setAsset(null);
      }
    } else if (currentView.existingAsset) {
      setAsset({
        url: currentView.existingAsset.url,
        type: currentView.existingAsset.type,
      });
    } else {
      setAsset(null);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [slide, media]);

  const ratio = getAspectRatioValue(aspectRatio);

  const renderContent = () => {
    if (!asset) {
      return (
        <Center w="100%" h="100%" bg="gray.1">
          <Stack align="center" gap="xs">
            <IconPhoto size={32} color="gray" />
            <Text c="dimmed" size="xs">
              Asset Yok
            </Text>
          </Stack>
        </Center>
      );
    }

    if (asset.type === "IMAGE") {
      return <CustomImage src={asset.url} alt="Slide içeriği" />;
    }

    if (asset.type === "VIDEO") {
      return (
        <video
          src={asset.url}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          autoPlay
          muted
          loop
          playsInline
        />
      );
    }

    return (
      <Center w="100%" h="100%" bg="red.1">
        <Stack align="center" gap="xs">
          <IconVideoOff size={32} color="red" />
          <Text c="red" size="xs">
            Geçersiz Asset Tipi
          </Text>
        </Stack>
      </Center>
    );
  };

  return (
    <Carousel.Slide>
      <AspectRatio pos="relative" ratio={ratio}>
        {renderContent()}
      </AspectRatio>
    </Carousel.Slide>
  );
};

interface FirstThemeSliderProps {
  data: SliderComponentOutputType;
}

const FirstThemeSlider = ({ data }: FirstThemeSliderProps) => {
  const { sliders, options } = data;
  const { media } = useTheme();
  const autoplay = useRef(
    Autoplay({ delay: options.autoPlayInterval || 3000 })
  );
  const isMobile = media === "mobile";
  const desktopRatio = options.aspectRatio;
  const mobileRatio = options.mobileAspectRatio;

  const currentAspectRatio =
    isMobile && mobileRatio ? mobileRatio : desktopRatio;

  const validSlides = sliders?.filter((slide) => {
    const hasData = (
      view: SlideOutputType["desktopView"] | null | undefined
    ): boolean => {
      return !!(view && (view.file || view.existingAsset));
    };

    if (media === "mobile") {
      return hasData(slide.mobileView) || hasData(slide.desktopView);
    }
    return hasData(slide.desktopView);
  });

  if (!validSlides || validSlides.length === 0) {
    return null;
  }

  return (
    <Box pos="relative" w="100%" className="group">
      <Carousel
        classNames={{
          root: "relative w-full",
          viewport: "overflow-hidden",
          container: "flex",
          slide: "min-w-0 transition-opacity duration-500",
          control:
            "bg-white/90 border-none text-black opacity-80 hover:opacity-100 hover:bg-white " +
            "transition-all duration-300 hover:scale-105 w-12 h-12 rounded " +
            "disabled:opacity-0 disabled:cursor-not-allowed md:w-12 md:h-12 max-md:w-9 max-md:h-9",
          indicator:
            "w-2.5 h-2.5 bg-white/40 transition-all duration-300 " +
            "data-[active]:bg-white data-[active]:w-7 max-md:w-2 max-md:h-2 max-md:data-[active]:w-5",
          indicators: "gap-2 bottom-4",
        }}
        withIndicators={media !== "desktop"}
        withControls={media === "desktop"}
        plugins={options.autoPlay ? [autoplay.current, Fade()] : [Fade()]}
        nextControlIcon={<IconChevronRight size={24} />}
        previousControlIcon={<IconChevronLeft size={24} />}
        slideSize="100%"
        slideGap={0}
        emblaOptions={{
          loop: options.loop,
          align: "start",
          slidesToScroll: 1,
          dragFree: false,
        }}
      >
        {validSlides?.map((slide) => (
          <SlideRenderer
            aspectRatio={currentAspectRatio}
            media={media}
            key={slide.sliderId}
            slide={slide}
          />
        ))}
      </Carousel>
    </Box>
  );
};

export default FirstThemeSlider;
