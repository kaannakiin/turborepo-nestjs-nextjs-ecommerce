"use client";
import { useTheme } from "@/(admin)/admin/(theme)/ThemeContexts/ThemeContext";
import FetchWrapperV2 from "@lib/fetchWrapper-v2";
import { Carousel } from "@mantine/carousel";
import { Paper, Title } from "@mantine/core";
import { useQuery } from "@repo/shared";
import {
  CategoryGridComponentReturnData,
  CategoryGridComponentType,
  TextAlign,
} from "@repo/types";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

interface CategoryGridComponentProps {
  data: CategoryGridComponentType;
}

const CategoryGridComponent = ({ data }: CategoryGridComponentProps) => {
  const { media } = useTheme();
  const { push } = useRouter();
  const {
    data: categories,
    isFetching,
    isPending,
    isLoading,
  } = useQuery({
    queryKey: ["get-categories-by-ids", data.categoryIds],
    queryFn: async () => {
      const api = new FetchWrapperV2();
      const apiRes = await api.post<CategoryGridComponentReturnData[]>(
        "/users/categories/get-categories-by-ids",
        {
          credentials: "include",
          body: JSON.stringify({ categoryIds: data.categoryIds }),
        }
      );
      if (apiRes.success) {
        return apiRes.data;
      }
      return [];
    },
    enabled: data.categoryIds.length > 0,
    refetchOnWindowFocus: false,
    retry: 0,
  });

  if (isLoading || isFetching || isPending) {
    return null;
  }

  if (!categories || categories.length === 0) {
    return null;
  }
  return (
    <div
      style={{
        backgroundColor: data.backgroundColor,
        padding: "2rem 0",
      }}
    >
      <Carousel
        slideSize={
          media === "mobile"
            ? `${100 / data.mobileGridColumns}%`
            : media === "desktop"
              ? `${100 / data.desktopGridColumns}%`
              : `${100 / data.tabletGridColumns}%`
        }
        slideGap={"md"}
        emblaOptions={{
          slidesToScroll:
            media === "mobile"
              ? data.mobileGridColumns
              : media === "desktop"
                ? data.desktopGridColumns
                : data.tabletGridColumns,
          loop: true,
          align: "start",
        }}
        nextControlIcon={<IconChevronRight color="white" />}
        previousControlIcon={<IconChevronLeft color="white" />}
        classNames={{
          control:
            "rounded-none! size-8! bg-black/50! hover:bg-black/70! border-none ",
        }}
        withIndicators={false}
      >
        {categories.map((category) => {
          const translation =
            category.translations.find((t) => t.locale === "TR") ||
            category.translations[0];
          if (!translation) return null;

          return (
            <Carousel.Slide
              key={category.id}
              onClick={() => push(`/categories/${translation.slug}`)}
            >
              <Paper
                shadow="md"
                p={"xl"}
                radius={"0"}
                className={`h-[440px] flex flex-col justify-between items-start bg-cover bg-center relative overflow-hidden cursor-pointer ${
                  data.imageScaleOnHover
                    ? "transition-transform duration-300 hover:scale-105"
                    : ""
                }`}
                style={{
                  backgroundImage: `url(${category.image.url})`,
                }}
              >
                {/* Overlay katmanı */}
                {data.showImageOverlay && (
                  <div
                    className="absolute inset-0 bg-black opacity-40 z-10"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
                  />
                )}

                <div className="relative z-20 w-full h-full flex flex-col justify-between">
                  {data.showCategoryNamesOnImages && (
                    <div
                      style={{
                        width: "100%",
                      }}
                    >
                      <Title
                        order={3}
                        mt={"xs"}
                        style={{
                          fontWeight: data.fontWeight,
                          color: data.textColor,
                          textAlign:
                            data.textAlign === TextAlign.left
                              ? "left"
                              : data.textAlign === TextAlign.center
                                ? "center"
                                : "right",
                        }}
                      >
                        {translation.name}
                      </Title>
                    </div>
                  )}
                </div>
              </Paper>
            </Carousel.Slide>
          );
        })}
      </Carousel>
    </div>
  );
};

export default CategoryGridComponent;
