"use client";
import { Carousel } from "@mantine/carousel";
import { AspectRatio, Image, Modal, SimpleGrid, Stack } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { $Enums } from "@repo/database/client";
import { IconX } from "@tabler/icons-react";
import Fade from "embla-carousel-fade";
import { useState } from "react";
import CustomImage from "../../../components/CustomImage";
import styles from "./Carousel.module.css";
interface ProductAssetViewerProps {
  assets: { url: string; type: $Enums.AssetType }[];
}

const ProductAssetViewer = ({ assets }: ProductAssetViewerProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);
  const [opened, { open, close }] = useDisclosure();

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
          <Carousel
            withIndicators
            withControls={false}
            className="w-full h-full"
            slideSize="100%"
            initialSlide={0}
            emblaOptions={{
              loop: true,
              startIndex: selectedAssetIndex,
            }}
            onSlideChange={(index) => setSelectedAssetIndex(index)}
            classNames={styles}
          >
            {assets.map((asset, index) => (
              <Carousel.Slide key={index}>
                <AspectRatio ratio={1} pos={"relative"}>
                  <CustomImage
                    src={asset.url}
                    alt={`Product image ${index + 1}`}
                  />
                </AspectRatio>
              </Carousel.Slide>
            ))}
          </Carousel>
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
                setSelectedAssetIndex(null);
              }}
              className="absolute top-4 right-4 z-10 bg-white rounded-full w-10 h-10 flex items-center justify-center"
              aria-label="Close"
            >
              <IconX />
            </button>
            <Carousel
              withIndicators={false}
              withControls={true}
              height={"100%"}
              slideSize="100%"
              plugins={[Fade()]}
              initialSlide={selectedAssetIndex}
              classNames={{
                control: styles.modalControl,
                controls: styles.modalControls,
              }}
              styles={{
                root: {
                  height: "100%",
                },
                slide: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                },
              }}
            >
              {assets.map((item, index) => (
                <Carousel.Slide
                  key={index}
                  className="flex items-center justify-center "
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
                </Carousel.Slide>
              ))}
            </Carousel>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ProductAssetViewer;
