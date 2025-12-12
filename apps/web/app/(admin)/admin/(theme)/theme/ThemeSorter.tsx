"use client";

import { Stack } from "@mantine/core";
import { Control, useWatch } from "@repo/shared";
import {
  MarqueeComponentInputType,
  ProductCarouselComponentInputType,
  SliderComponentOutputType,
  ThemeInputType,
} from "@repo/types";
import { memo, useMemo } from "react";
import FirstThemeMarquee from "./first-theme/FirstThemeMarquee";
import FirstThemeProductCarousel from "./first-theme/FirstThemeProductCarousel";
import FirstThemeSlider from "./first-theme/FirstThemeSlider";
import { useThemeStore } from "./store/theme-store";

interface ThemeSorterProps {
  control: Control<ThemeInputType>;
}

const ThemeSorter = ({ control }: ThemeSorterProps) => {
  const { activePage } = useThemeStore();

  const pages = useWatch({
    control,
    name: "pages",
  });

  const sortedComponents = useMemo(() => {
    const activePageData = pages?.find((page) => page.pageType === activePage);

    if (!activePageData || !activePageData.components) return [];

    return [...activePageData.components].sort((a, b) => a.order - b.order);
  }, [pages, activePage]);

  if (sortedComponents.length === 0) return null;

  return (
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
  );
};

export default memo(ThemeSorter);
