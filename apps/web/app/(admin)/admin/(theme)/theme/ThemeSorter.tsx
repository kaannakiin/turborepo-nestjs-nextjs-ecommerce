"use client";

import { Stack } from "@mantine/core";
import { Control, useWatch } from "@repo/shared";
import {
  MarqueeComponentInputType,
  ProductCarouselComponentInputType,
  SliderComponentOutputType,
  ThemeInputType,
} from "@repo/types";
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
  const data = pages.find((page) => page.pageType === activePage);
  if (!data) return null;

  return (
    <>
      <Stack gap="xs">
        {data?.components
          .sort((a, b) => a.order - b.order)
          .map((component) => {
            switch (component.type) {
              case "SLIDER":
                return (
                  <FirstThemeSlider
                    key={component.componentId}
                    data={component as SliderComponentOutputType}
                  />
                );
              case "MARQUEE":
                return (
                  <FirstThemeMarquee
                    key={component.componentId}
                    data={component as MarqueeComponentInputType}
                  />
                );

              case "PRODUCT_CAROUSEL":
                return (
                  <FirstThemeProductCarousel
                    key={component.componentId}
                    data={component as ProductCarouselComponentInputType}
                  />
                );
            }
          })}
      </Stack>
    </>
  );
};

export default ThemeSorter;
