import { useTheme } from "@/context/theme-context/ThemeContext";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper from "@lib/wrappers/fetchWrapper";
import { Carousel } from "@mantine/carousel";
import { Box, Container, Stack, Text, Title } from "@mantine/core";
import { keepPreviousData, useQuery, useQueryClient } from "@repo/shared";
import { ProductCarouselComponentInputType, ProductCart } from "@repo/types";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import { useMemo, useRef } from "react";
import FirstThemeProductCart from "./FirstThemeProductCart";
import classes from "./modules/ProductCarousel.module.css";
import AutoHeight from "embla-carousel-auto-height";
interface FirstThemeProductCarouselProps {
  data: ProductCarouselComponentInputType;
}

const FirstThemeProductCarousel = ({
  data,
}: FirstThemeProductCarouselProps) => {
  const queryClient = useQueryClient();
  const { config, title, description } = data;
  const { media } = useTheme();
  const autoplay = useRef(
    Autoplay({ delay: config.autoplaySpeed, stopOnInteraction: false })
  );

  const { productIds, variantIds } = useMemo(() => {
    const pIds = data.items
      .filter((item) => item.productId && !item.variantId)
      .map((item) => item.productId!)
      .sort();

    const vIds = data.items
      .filter((item) => item.variantId)
      .map((item) => item.variantId!)
      .sort();

    return { productIds: pIds, variantIds: vIds };
  }, [data.items]);

  const queryKey = [
    "theme-carousel",
    { componentId: data.componentId, p: productIds, v: variantIds },
  ];

  const { data: productsData, isLoading } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      if (productIds.length === 0 && variantIds.length === 0) {
        return { products: [], variants: [] };
      }

      const existingQueries = queryClient.getQueriesData<{
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

  if (isLoading) return <GlobalLoadingOverlay />;
  if (slides.length === 0) return null;

  return (
    <Box component="section" py="xl">
      <Container size="xl">
        {(title || description) && (
          <Stack mb="xl" align="center" gap="xs">
            {title && (
              <Title
                order={2}
                style={{ color: config.titleTextColor || "inherit" }}
                ta="center"
              >
                {title}
              </Title>
            )}
            {description && (
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

        <Carousel
          withIndicators={config.showDots}
          className="items-start"
          withControls={config.showArrows}
          emblaOptions={{
            loop: config.loop,
            align: "start",
            slidesToScroll:
              media === "desktop"
                ? config.slidesPerViewDesktop
                : media === "tablet"
                  ? config.slidesPerViewTablet
                  : config.slidesPerViewMobile,
          }}
          slideSize={
            media === "desktop"
              ? `${100 / config.slidesPerViewDesktop}%`
              : media === "tablet"
                ? `${100 / config.slidesPerViewTablet}%`
                : `${100 / config.slidesPerViewMobile}%`
          }
          slideGap={{ base: "md", md: "lg" }}
          plugins={
            config.autoplay
              ? [autoplay.current, Fade(), AutoHeight()]
              : [Fade(), AutoHeight()]
          }
          onMouseEnter={config.autoplay ? autoplay.current.stop : undefined}
          onMouseLeave={config.autoplay ? autoplay.current.reset : undefined}
          classNames={{
            root: classes.root,
            controls: classes.controls,
            control: classes.control,
            indicator: classes.indicator,
          }}
          controlsOffset={"xs"}
        >
          {slides.map((product) => (
            <Carousel.Slide key={product.id}>
              <FirstThemeProductCart
                data={product}
                aspectRatio={config.aspectRatio}
                showAddToCartButton={config.showAddToCartButton}
              />
            </Carousel.Slide>
          ))}
        </Carousel>
      </Container>
    </Box>
  );
};

export default FirstThemeProductCarousel;
