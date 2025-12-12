"use client";
import { generateColorTuple } from "@lib/helpers";
import {
  Button,
  MantineColorShade,
  MantineProvider,
  Stack,
} from "@mantine/core";
import { Control, useWatch } from "@repo/shared";
import {
  MarqueeComponentInputType,
  ProductCarouselComponentInputType,
  SliderComponentOutputType,
  ThemeInputType,
} from "@repo/types";
import { memo, useMemo, useRef } from "react";
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

  const pages = useWatch({
    control,
    name: "pages",
  });

  const settings = useWatch({
    control,
    name: "settings",
  });

  const sortedComponents = useMemo(() => {
    const activePageData = pages?.find((page) => page.pageType === activePage);
    if (!activePageData || !activePageData.components) return [];
    return [...activePageData.components].sort((a, b) => a.order - b.order);
  }, [pages, activePage]);

  const previewTheme = useMemo(
    () => ({
      primaryColor: "primary",
      primaryShade: {
        dark: (settings?.primaryShade as MantineColorShade) ?? 5,
        light: (settings?.primaryShade as MantineColorShade) ?? 5,
      },
      colors: {
        primary: generateColorTuple(settings?.primaryColor ?? "#3b82f6"),
        secondary: generateColorTuple(settings?.secondaryColor ?? "#6b7280"),
      },
    }),
    [settings?.primaryColor, settings?.secondaryColor, settings?.primaryShade]
  );

  if (sortedComponents.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="theme-preview-container"
      style={{ isolation: "isolate" }}
    >
      <MantineProvider
        theme={previewTheme}
        cssVariablesSelector=".theme-preview-container"
        getRootElement={() => containerRef.current ?? undefined}
        forceColorScheme="light"
      >
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
    </div>
  );
};

export default memo(ThemeSorter);
