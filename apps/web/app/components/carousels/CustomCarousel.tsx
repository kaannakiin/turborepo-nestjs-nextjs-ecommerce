import { ReactNode, useEffect, useState } from "react";

import "swiper/css";

import {
  Swiper,
  SwiperProps,
  SwiperSlide,
  SwiperSlideProps,
} from "swiper/react";
import type { SwiperModule } from "swiper/types";

export interface SlideItem {
  id?: string | number;
  content: ReactNode;
  props?: SwiperSlideProps;
}

interface CarouselProps extends SwiperProps {
  slides: SlideItem[];
  className?: string;
}

const CustomCarousel = ({
  slides,
  className,
  ...swiperProps
}: CarouselProps) => {
  const [modules, setModules] = useState<SwiperModule[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadModules = async () => {
      const imports: Promise<SwiperModule>[] = [];
      const cssImports: Promise<void>[] = [];

      const swiperModulesPkg = import("swiper/modules");

      if (swiperProps.navigation) {
        imports.push(swiperModulesPkg.then((m) => m.Navigation));
        cssImports.push(import("swiper/css/navigation"));
      }

      if (swiperProps.pagination) {
        imports.push(swiperModulesPkg.then((m) => m.Pagination));
        cssImports.push(import("swiper/css/pagination"));
      }

      if (swiperProps.scrollbar) {
        imports.push(swiperModulesPkg.then((m) => m.Scrollbar));
        cssImports.push(import("swiper/css/scrollbar"));
      }

      if (swiperProps.autoplay) {
        imports.push(swiperModulesPkg.then((m) => m.Autoplay));
      }

      if (swiperProps.parallax) {
        imports.push(swiperModulesPkg.then((m) => m.Parallax));
      }

      if (swiperProps.zoom) {
        imports.push(swiperModulesPkg.then((m) => m.Zoom));
        cssImports.push(import("swiper/css/zoom"));
      }

      if (swiperProps.keyboard) {
        imports.push(swiperModulesPkg.then((m) => m.Keyboard));
      }

      if (swiperProps.mousewheel) {
        imports.push(swiperModulesPkg.then((m) => m.Mousewheel));
      }

      if (swiperProps.virtual) {
        imports.push(swiperModulesPkg.then((m) => m.Virtual));
      }

      if (swiperProps.a11y) {
        imports.push(swiperModulesPkg.then((m) => m.A11y));
      }

      if (swiperProps.controller) {
        imports.push(swiperModulesPkg.then((m) => m.Controller));
      }

      if (swiperProps.history) {
        imports.push(swiperModulesPkg.then((m) => m.History));
      }

      if (swiperProps.hashNavigation) {
        imports.push(swiperModulesPkg.then((m) => m.HashNavigation));
      }

      if (swiperProps.thumbs) {
        imports.push(swiperModulesPkg.then((m) => m.Thumbs));
        cssImports.push(import("swiper/css/thumbs"));
      }

      if (swiperProps.freeMode) {
        imports.push(swiperModulesPkg.then((m) => m.FreeMode));
        cssImports.push(import("swiper/css/free-mode"));
      }

      if (swiperProps.grid) {
        imports.push(swiperModulesPkg.then((m) => m.Grid));
        cssImports.push(import("swiper/css/grid"));
      }

      switch (swiperProps.effect) {
        case "fade":
          imports.push(swiperModulesPkg.then((m) => m.EffectFade));
          cssImports.push(import("swiper/css/effect-fade"));
          break;
        case "cube":
          imports.push(swiperModulesPkg.then((m) => m.EffectCube));
          cssImports.push(import("swiper/css/effect-cube"));
          break;
        case "flip":
          imports.push(swiperModulesPkg.then((m) => m.EffectFlip));
          cssImports.push(import("swiper/css/effect-flip"));
          break;
        case "coverflow":
          imports.push(swiperModulesPkg.then((m) => m.EffectCoverflow));
          cssImports.push(import("swiper/css/effect-coverflow"));
          break;
        case "cards":
          imports.push(swiperModulesPkg.then((m) => m.EffectCards));
          cssImports.push(import("swiper/css/effect-cards"));
          break;
        case "creative":
          imports.push(swiperModulesPkg.then((m) => m.EffectCreative));
          cssImports.push(import("swiper/css/effect-creative"));
          break;
      }

      try {
        const [loadedModules] = await Promise.all([
          Promise.all(imports),
          Promise.all(cssImports),
        ]);

        setModules(loadedModules);
        setIsReady(true);
      } catch (error) {
        console.error("Swiper modülleri yüklenirken hata oluştu:", error);

        setIsReady(true);
      }
    };

    loadModules();
  }, [
    swiperProps.navigation,
    swiperProps.pagination,
    swiperProps.scrollbar,
    swiperProps.autoplay,
    swiperProps.parallax,
    swiperProps.zoom,
    swiperProps.effect,
    swiperProps.thumbs,
    swiperProps.controller,
    swiperProps.virtual,
    swiperProps.mousewheel,
    swiperProps.keyboard,
    swiperProps.a11y,
    swiperProps.history,
    swiperProps.hashNavigation,
    swiperProps.freeMode,
    swiperProps.grid,
  ]);

  if (!isReady) {
    return (
      <div
        className={`w-full h-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-400 ${className}`}
      >
        Yükleniyor...
      </div>
    );
  }

  return (
    <Swiper
      modules={modules}
      className={`w-full h-full ${className || ""}`}
      {...swiperProps}
    >
      {slides.map((item, index) => (
        <SwiperSlide key={item.id || index} {...item.props}>
          {item.content}
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default CustomCarousel;
