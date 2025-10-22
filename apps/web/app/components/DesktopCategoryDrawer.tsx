"use client";
import {
  AspectRatio,
  Grid,
  HoverCard,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { CategoryHeaderData } from "@repo/types";
import { $Enums } from "@repo/database";
import Link from "next/link";
import CustomImage from "./CustomImage";

interface DesktopCategoryDrawerProps {
  category: CategoryHeaderData;
  locale: $Enums.Locale;
}

const DesktopCategoryDrawer = ({
  category,
  locale,
}: DesktopCategoryDrawerProps) => {
  const translation =
    category.translations.find((t) => t.locale === locale) ||
    category.translations[0];

  if (!translation) {
    return null;
  }
  const hasChildren =
    category.allChildCategories && category.allChildCategories.length > 0;

  return (
    <>
      <div className="relative cursor-pointer group h-full flex items-center ">
        {hasChildren ? (
          <HoverCard
            width={"100%"}
            transitionProps={{
              transition: "fade-down",
              duration: 400,
              timingFunction: "ease",
            }}
          >
            <HoverCard.Target>
              <Link href={`/categories/${translation.slug}`}>
                <Text
                  fz={"md"}
                  fw={700}
                  className="transition-colors duration-200 group-hover:text-[var(--mantine-primary-color-5)] group-hover:underline group-hover:underline-offset-8"
                >
                  {translation.name}
                </Text>
              </Link>
            </HoverCard.Target>
            <HoverCard.Dropdown
              mt={"md"}
              p={"xl"}
              mih={"50vh"}
              bg={"gray.0"}
              className="w-full "
            >
              <Grid className="w-full h-full max-w-[1250px] mx-auto">
                <Grid.Col span={7}>
                  <Stack gap={"lg"}>
                    {hasChildren &&
                      category.allChildCategories.map((child) => {
                        const translation =
                          child.translations.find((t) => t.locale === locale) ||
                          child.translations[0];
                        if (!translation) return null;
                        return (
                          <Link
                            key={child.id}
                            href={`/categories/${translation.slug}`}
                          >
                            <Text
                              fz={"md"}
                              fw={500}
                              className="transition-colors duration-200 hover:text-[var(--mantine-primary-color-5)] hover:underline hover:underline-offset-8"
                            >
                              {translation.name}
                            </Text>
                          </Link>
                        );
                      })}
                  </Stack>
                </Grid.Col>
                <Grid.Col span={5}>
                  <SimpleGrid cols={2}>
                    {category.productImages &&
                      category.productImages.length > 0 &&
                      category.productImages.map((image) => (
                        <AspectRatio ratio={1} key={image.url} pos={"relative"}>
                          <CustomImage src={image.url} />
                        </AspectRatio>
                      ))}
                  </SimpleGrid>
                </Grid.Col>
              </Grid>
            </HoverCard.Dropdown>
          </HoverCard>
        ) : (
          <Link href={`/categories/${translation.slug}`}>
            <Text
              fz={"md"}
              fw={700}
              className="transition-colors duration-200 group-hover:text-[var(--mantine-primary-color-5)] group-hover:underline group-hover:underline-offset-8"
            >
              {translation.name}
            </Text>
          </Link>
        )}
      </div>
    </>
  );
};

export default DesktopCategoryDrawer;
