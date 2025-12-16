"use client";
import {
  getFontFamily,
  useGoogleFonts,
} from "@/components/hooks/useGoogleFont";
import { generateColorTuple } from "@lib/helpers";
import {
  Button,
  MantineColorShade,
  MantineProvider,
  Stack,
  createTheme,
} from "@mantine/core";
import { Control, useWatch } from "@repo/shared";
import {
  MarqueeComponentInputType,
  ProductCarouselComponentInputType,
  SliderComponentOutputType,
  ThemeInputType,
} from "@repo/types";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import FirstThemeHeader from "./first-theme/header-section/FirstThemeHeader";
import FirstThemeMarquee from "./first-theme/FirstThemeMarquee";
import FirstThemeProductCarousel from "./first-theme/FirstThemeProductCarousel";
import FirstThemeSlider from "./first-theme/FirstThemeSlider";
import { useThemeStore } from "./store/theme-store";

interface ThemeSorterProps {
  control: Control<ThemeInputType>;
}

const ThemeSorter = ({ control }: ThemeSorterProps) => {
  const { activePage } = useThemeStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pages = useWatch({
    control,
    name: "pages",
  });

  const settings = useWatch({
    control,
    name: "settings",
  });

  const header = useWatch({
    control,
    name: "header",
  });

  useGoogleFonts(settings?.font);

  const sortedComponents = useMemo(() => {
    const activePageData = pages?.find((page) => page.pageType === activePage);
    if (!activePageData || !activePageData.components) return [];
    return [...activePageData.components].sort((a, b) => a.order - b.order);
  }, [pages, activePage]);

  const previewTheme = useMemo(() => {
    const selectedFontFamily = getFontFamily(settings?.font);

    return createTheme({
      primaryColor: "primary",
      primaryShade: {
        dark: (Number(settings?.primaryShade) as MantineColorShade) ?? 5,
        light: (Number(settings?.primaryShade) as MantineColorShade) ?? 5,
      },
      colors: {
        primary: generateColorTuple(settings?.primaryColor ?? "#3b82f6"),
        secondary: generateColorTuple(settings?.secondaryColor ?? "#6b7280"),
      },

      fontFamily: selectedFontFamily,
      fontFamilyMonospace: selectedFontFamily,
      headings: {
        fontFamily: selectedFontFamily,
      },
    });
  }, [
    settings?.primaryColor,
    settings?.secondaryColor,
    settings?.primaryShade,
    settings?.font,
  ]);

  if (sortedComponents.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="theme-preview-container isolate contain-layout"
    >
      {mounted && (
        <MantineProvider
          theme={previewTheme}
          cssVariablesSelector=".theme-preview-container"
          getRootElement={() => containerRef.current ?? undefined}
          forceColorScheme="light"
        >
          {header && <FirstThemeHeader data={header} />}
          <Stack gap="xs">
            {sortedComponents.map((component, index) => {
              const key = `${component.componentId}-${index}`;
              switch (component.type) {
                case "SLIDER":
                  return (
                    <FirstThemeSlider
                      key={key}
                      data={component as SliderComponentOutputType}
                    />
                  );
                case "MARQUEE":
                  return (
                    <FirstThemeMarquee
                      key={key}
                      data={component as MarqueeComponentInputType}
                    />
                  );
                case "PRODUCT_CAROUSEL":
                  return (
                    <FirstThemeProductCarousel
                      key={key}
                      data={component as ProductCarouselComponentInputType}
                    />
                  );
                default:
                  return null;
              }
            })}
          </Stack>
        </MantineProvider>
      )}
    </div>
  );
};

export default ThemeSorter;
