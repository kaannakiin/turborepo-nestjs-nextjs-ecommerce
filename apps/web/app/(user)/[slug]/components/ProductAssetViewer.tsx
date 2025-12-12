"use client";
import { AspectRatio, Image, Modal, SimpleGrid, Stack } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { AssetType } from "@repo/database/client";
import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import CustomImage from "../../../components/CustomImage";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import styles from "./Carousel.module.css";

interface ProductAssetViewerProps {
  assets: { url: string; type: AssetType }[];
}

const ProductAssetViewer = ({ assets }: ProductAssetViewerProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);
  const [opened, { open, close }] = useDisclosure();
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

  if (!assets || assets.length === 0) {
    return <div>No assets available</div>;
  }

  const handleImageClick = (index: number) => {
    setSelectedAssetIndex(index);
    open();
  };

  return (
    <>
      <div
        key={isMobile ? "mobile" : "desktop"}
        className="w-full h-full relative"
      >
        {isMobile ? (
          <Swiper
            modules={[Pagination]}
            pagination={{
              clickable: true,
              el: `.${styles.indicators}`,
              bulletClass: styles.indicator,
              bulletActiveClass: styles.indicatorActive,
            }}
            loop={true}
            initialSlide={selectedAssetIndex}
            onSlideChange={(swiper) => setSelectedAssetIndex(swiper.realIndex)}
            className="w-full h-full"
          >
            {assets.map((asset, index) => (
              <SwiperSlide key={index}>
                <AspectRatio ratio={1} pos={"relative"}>
                  <CustomImage
                    src={asset.url}
                    alt={`Product image ${index + 1}`}
                  />
                </AspectRatio>
              </SwiperSlide>
            ))}
            <div className={styles.indicators} />
          </Swiper>
        ) : (
          <Stack gap="md">
            <div className="cursor-pointer" onClick={() => handleImageClick(0)}>
              <AspectRatio ratio={1} pos={"relative"}>
                <CustomImage
                  src={assets[0].url}
                  className="rounded-lg"
                  alt="Main product image"
                />
              </AspectRatio>
            </div>
            {assets.length > 1 && (
              <SimpleGrid cols={2} spacing="xl">
                {assets.slice(1).map((asset, index) => {
                  const actualIndex = index + 1;
                  return (
                    <AspectRatio
                      ratio={1}
                      key={asset.url}
                      className="cursor-pointer"
                      onClick={() => handleImageClick(actualIndex)}
                    >
                      <CustomImage
                        src={asset.url}
                        className="rounded-lg overflow-hidden"
                        alt={`Product image ${actualIndex + 1}`}
                      />
                    </AspectRatio>
                  );
                })}
              </SimpleGrid>
            )}
          </Stack>
        )}
      </div>

      {!isMobile && (
        <Modal
          opened={opened}
          onClose={close}
          fullScreen
          transitionProps={{ transition: "fade", duration: 200 }}
          padding={0}
          withCloseButton={false}
          styles={{
            content: { height: "100%" },
            body: { height: "100%", padding: 0 },
            header: { display: "none" },
            inner: { padding: 0 },
          }}
        >
          <div className="relative h-full">
            <button
              type="button"
              onClick={() => {
                close();
                setSelectedAssetIndex(0);
              }}
              className="absolute top-4 right-4 z-10 bg-white rounded-full w-10 h-10 flex items-center justify-center"
              aria-label="Close"
            >
              <IconX />
            </button>

            {/* Custom Navigation Buttons */}
            <button
              type="button"
              className={`${styles.modalControl} ${styles.modalControlPrev}`}
              onClick={() => swiperInstance?.slidePrev()}
              aria-label="Previous"
            >
              <IconChevronLeft />
            </button>
            <button
              type="button"
              className={`${styles.modalControl} ${styles.modalControlNext}`}
              onClick={() => swiperInstance?.slideNext()}
              aria-label="Next"
            >
              <IconChevronRight />
            </button>

            <Swiper
              modules={[Navigation, EffectFade]}
              effect="fade"
              fadeEffect={{ crossFade: true }}
              initialSlide={selectedAssetIndex}
              onSwiper={setSwiperInstance}
              className="h-full"
              style={{ height: "100%" }}
            >
              {assets.map((item, index) => (
                <SwiperSlide
                  key={index}
                  className="flex items-center justify-center"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.type === "IMAGE" ? (
                    <Image
                      src={item.url}
                      alt={`Product ${index + 1}`}
                      className="max-w-full max-h-full"
                      style={{
                        objectFit: "contain",
                        aspectRatio: "1/1",
                        width: "auto",
                        height: "auto",
                      }}
                    />
                  ) : (
                    <video
                      src={item.url}
                      controls={false}
                      muted
                      loop
                      playsInline
                      autoPlay
                      className="max-w-full max-h-full"
                      style={{
                        objectFit: "contain",
                        aspectRatio: "1/1",
                        width: "auto",
                        height: "auto",
                      }}
                    />
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ProductAssetViewer;
