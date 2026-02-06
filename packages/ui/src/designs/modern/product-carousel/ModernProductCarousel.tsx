"use client";

import { Badge, Box, Button, Card, Stack, Text } from "@mantine/core";
import { getPriceRange, getProductAsset, getProductName } from "@repo/shared";
import { ProductCarouselPreviewProps } from "@repo/types";
import { IconShoppingCart } from "@tabler/icons-react";
import { FreeMode, Mousewheel } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "../../../common/Image";

import "swiper/css";
import "swiper/css/free-mode";
import "./styles.css";

const ModernProductCarousel = ({
  data,
  isSelected,
  onSelect,
  media,
  currency,
  locale,
}: ProductCarouselPreviewProps) => {
  const products = data.products || [];

  return (
    <Box
      onClick={onSelect}
      style={{
        cursor: "pointer",
        padding: "var(--mantine-spacing-xl)",
        backgroundColor: data.backgroundColor || "transparent",
        borderRadius: "var(--mantine-radius-md)",
        border: isSelected
          ? "2px solid var(--mantine-color-blue-6)"
          : "2px solid transparent",
      }}
    >
      {(data.title || data.subtitle) && (
        <Box mb="xl">
          {data.title && (
            <Text
              size={data.titleSize || "xl"}
              fw={700}
              mb={data.subtitle ? "xs" : 0}
              style={{ color: data.titleColor || undefined }}
            >
              {data.title}
            </Text>
          )}
          {data.subtitle && (
            <Text
              size={data.subtitleSize || "sm"}
              c="dimmed"
              style={{ color: data.subtitleColor || undefined }}
            >
              {data.subtitle}
            </Text>
          )}
        </Box>
      )}

      {products.length > 0 ? (
        <Swiper
          modules={[FreeMode, Mousewheel]}
          spaceBetween={24}
          slidesPerView="auto"
          freeMode={{
            enabled: true,
            momentum: true,
            momentumRatio: 0.5,
            momentumVelocityRatio: 0.5,
          }}
          mousewheel={{
            forceToAxis: true,
          }}
          grabCursor={true}
          className="product-carousel-swiper"
        >
          {products.map((product, index) => (
            <SwiperSlide key={product.uniqueId} className="product-slide">
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                className="product-card"
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                {product.isCustomBadgeActive && product.customBadgeText && (
                  <Badge
                    color={product.customBadgeColor || "blue"}
                    variant="filled"
                    size="sm"
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      zIndex: 1,
                      color: product.customBadgeTextColor || "white",
                    }}
                  >
                    {product.customBadgeText}
                  </Badge>
                )}

                {(() => {
                  const asset = product.productData
                    ? getProductAsset(product.productData)
                    : null;
                  const productName = product.productData
                    ? getProductName(product.productData, locale)
                    : `Product ${index + 1}`;

                  return asset?.url ? (
                    <Box
                      style={{
                        aspectRatio: "1",
                        borderRadius: "var(--mantine-radius-sm)",
                        marginBottom: "var(--mantine-spacing-md)",
                        overflow: "hidden",
                      }}
                    >
                      <Image
                        src={asset.url}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        enableProgressiveLoading={true}
                      />
                    </Box>
                  ) : (
                    <Box
                      style={{
                        aspectRatio: "1",
                        backgroundColor: "var(--mantine-color-gray-1)",
                        borderRadius: "var(--mantine-radius-sm)",
                        marginBottom: "var(--mantine-spacing-md)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text c="dimmed" size="xs">
                        No Image
                      </Text>
                    </Box>
                  );
                })()}

                <Stack gap="xs" style={{ flex: 1 }}>
                  <Text fw={600} lineClamp={2} size="sm">
                    {product.productData
                      ? getProductName(product.productData, locale)
                      : `Product ${index + 1}`}
                  </Text>

                  {data.showPrice && product.productData && (
                    <Text fw={700} size="lg" c="blue">
                      {
                        getPriceRange(product.productData, currency, locale)
                          .display
                      }
                    </Text>
                  )}
                </Stack>

                {data.showAddToCartButton && (
                  <Button
                    fullWidth
                    mt="md"
                    leftSection={<IconShoppingCart size={18} />}
                    variant="filled"
                    radius="md"
                  >
                    Add to Cart
                  </Button>
                )}
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <Stack align="center" py="xl" gap="xs">
          <Text size="sm" c="dimmed">
            No products added
          </Text>
        </Stack>
      )}
    </Box>
  );
};

export default ModernProductCarousel;
