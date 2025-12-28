import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import { useTheme } from "@/context/theme-context/ThemeContext";
import fetchWrapper from "@lib/wrappers/fetchWrapper";
import { Box, Container, Stack, Text, Title } from "@mantine/core";
import { keepPreviousData, useQuery } from "@repo/shared";
import { ProductCarouselComponentInputType, ProductCart } from "@repo/types";
import { useMemo } from "react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import FirstThemeProductCart from "./FirstThemeProductCart";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface FirstThemeProductCarouselProps {
  data: ProductCarouselComponentInputType;
}

const FirstThemeProductCarousel = ({
  data,
}: FirstThemeProductCarouselProps) => {
  const { config, title, description } = data;

  const { actualMedia: media } = useTheme();
  const productIds = data.items
    .filter((item) => item.productId && !item.variantId)
    .map((item) => item.productId!)
    .sort();
  const variantIds = data.items
    .filter((item) => item.variantId)
    .map((item) => item.variantId!)
    .sort();

  const queryKey = [
    "theme-carousel",
    { componentId: data.componentId, p: productIds, v: variantIds },
  ];

  const { data: productsData, isLoading } = useQuery({
    queryKey: queryKey,
    queryFn: async ({ client }) => {
      if (productIds.length === 0 && variantIds.length === 0) {
        return { products: [], variants: [] };
      }

      const existingQueries = client.getQueriesData<{
        products: ProductCart[];
        variants: ProductCart[];
      }>({ queryKey: ["theme-carousel"] });

      const foundInCache = existingQueries.find(([_, cachedData]) => {
        if (!cachedData) return false;
        const hasAllProducts = productIds.every((id) =>
          cachedData.products.some((p) => p.id === id)
        );
        const hasAllVariants = variantIds.every((id) =>
          cachedData.variants.some((v) => v.id === id)
        );
        return hasAllProducts && hasAllVariants;
      });

      if (foundInCache) {
        const cachedData = foundInCache[1];
        return {
          products: cachedData.products.filter((p) =>
            productIds.includes(p.id)
          ),
          variants: cachedData.variants.filter((v) =>
            variantIds.includes(v.id)
          ),
        };
      }

      const response = await fetchWrapper.post<{
        success: boolean;
        products: ProductCart[];
        variants: ProductCart[];
      }>("/admin/themev2/carousel-products", {
        productIds,
        variantIds,
      });

      if (!response.success) throw new Error("Hata oluştu.");
      return response.data;
    },
    enabled: productIds.length > 0 || variantIds.length > 0,
    placeholderData: keepPreviousData,
  });

  const slides = useMemo(() => {
    if (!productsData) return [];

    const pool = [
      ...(productsData.products || []),
      ...(productsData.variants || []),
    ];

    return data.items
      .map((cmsItem) => {
        const found = pool.find(
          (p) => p.id === (cmsItem.variantId || cmsItem.productId)
        );
        if (!found) return null;

        return {
          ...found,
          displayTitle: cmsItem.customTitle || found.name,
          displayBadge: cmsItem.badgeText,
        };
      })
      .filter(Boolean) as (ProductCart & {
      displayTitle: string;
      displayBadge?: string;
    })[];
  }, [productsData, data.items]);

  const currentSlidesPerView =
    media === "desktop"
      ? config.slidesPerViewDesktop
      : media === "tablet"
        ? config.slidesPerViewTablet
        : config.slidesPerViewMobile;

  const currentSpaceBetween =
    media === "desktop" ? 24 : media === "tablet" ? 20 : 16;

  // Başlık ve açıklama gösterim kontrolü
  const shouldShowTitle = config.showTitle && title;
  const shouldShowDescription = config.showDescription && description;
  const shouldShowHeader = shouldShowTitle || shouldShowDescription;

  if (isLoading) return <GlobalLoadingOverlay />;
  if (slides.length === 0) return null;

  return (
    <Box component="section" py="xl">
      <Container size="xl">
        {shouldShowHeader && (
          <Stack mb="xl" align="center" gap="xs">
            {shouldShowTitle && (
              <Title
                order={2}
                style={{ color: config.titleTextColor || "inherit" }}
                ta="center"
              >
                {title}
              </Title>
            )}
            {shouldShowDescription && (
              <Text
                c={config.descriptionTextColor || "dimmed"}
                ta="center"
                maw={600}
              >
                {description}
              </Text>
            )}
          </Stack>
        )}

        <Swiper
          modules={[Navigation, Autoplay, Pagination]}
          slidesPerView={currentSlidesPerView}
          spaceBetween={currentSpaceBetween}
          loop={config.loop}
          navigation={config.showArrows}
          pagination={
            config.showDots ? { clickable: true, dynamicBullets: true } : false
          }
          autoplay={
            config.autoplay
              ? {
                  delay: config.autoplaySpeed,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
              : false
          }
          style={{ paddingBottom: config.showDots ? "40px" : "0" }}
          key={media}
        >
          {slides.map((product) => (
            <SwiperSlide key={product.id} style={{ height: "auto" }}>
              <FirstThemeProductCart
                data={product}
                aspectRatio={config.aspectRatio}
                showAddToCartButton={config.showAddToCartButton}
                showDiscountBadge={config.showDiscountBadge}
                badgeBackgroundColor={config.badgeBackgroundColor}
                badgeTextColor={config.badgeTextColor}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </Container>
    </Box>
  );
};

export default FirstThemeProductCarousel;
