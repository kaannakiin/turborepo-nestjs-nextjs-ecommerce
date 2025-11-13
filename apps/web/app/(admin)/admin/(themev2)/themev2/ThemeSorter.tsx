"use client";

import { Control, useWatch } from "@repo/shared";
import {
  MarqueeComponentInputType,
  SliderComponentOutputType,
  ThemeInputType,
} from "@repo/types";
import FirstThemeMarquee from "./first-theme/FirstThemeMarquee";
import FirstThemeSlider from "./first-theme/FirstThemeSlider";

interface ThemeSorterProps {
  control: Control<ThemeInputType>;
}
const ThemeSorter = ({ control }: ThemeSorterProps) => {
  const data = useWatch({
    control,
    name: "components",
  });
  return (
    <>
      {data
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
          }
        })}
    </>
  );
};

export default ThemeSorter;
