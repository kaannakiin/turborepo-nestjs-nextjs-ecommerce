"use client";
import MainPageProductList from "@/users-ui-components/MainPageProductList";
import { Stack } from "@mantine/core";
import { MainPageComponentsType } from "@repo/types";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import FooterComponent from "./FooterComponent";

const MainPageSliderCarousel = dynamic(
  () => import("@/users-ui-components/MainPageSliderCarousel"),
  { ssr: false }
);
const MainPageMarquee = dynamic(
  () => import("@/users-ui-components/MainPageMarquee"),
  { ssr: false }
);

const CategoryGridComponent = dynamic(
  () => import("@/users-ui-components/CategoryGridComponent"),
  { ssr: false }
);
interface AdminThemeViewerProps {
  data: MainPageComponentsType;
}

const AdminThemeViewer = ({ data }: AdminThemeViewerProps) => {
  // Memoized sorted components - null check burada yapılıyor
  const sortedComponents = useMemo(() => {
    const safeComponents = data?.components || [];
    return safeComponents
      .filter(Boolean)
      .sort((a, b) => a.layoutOrder - b.layoutOrder);
  }, [data?.components]);

  const renderComponent = (component: (typeof sortedComponents)[0]) => {
    switch (component.type) {
      case "SLIDER":
        return component.data.length > 0 ? (
          <MainPageSliderCarousel
            key={`slider-${component.layoutOrder}`}
            data={component.data}
          />
        ) : null;
      case "MARQUEE":
        return (
          <MainPageMarquee
            key={`marquee-${component.data.uniqueId}`}
            data={component.data}
          />
        );
      case "PRODUCT_LIST":
        return (
          <MainPageProductList
            key={`product-list-${component.data.uniqueId}`}
            data={component.data}
          />
        );
      case "CATEGORY_GRID":
        return (
          <CategoryGridComponent
            data={component.data}
            key={`category-grid-${component.data.uniqueId}`}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Stack gap={"xl"} className="w-full lg:mx-auto">
        {sortedComponents.map(renderComponent).filter(Boolean)}
        {data.footer && <FooterComponent footerData={data.footer} />}
      </Stack>
    </>
  );
};

export default AdminThemeViewer;
