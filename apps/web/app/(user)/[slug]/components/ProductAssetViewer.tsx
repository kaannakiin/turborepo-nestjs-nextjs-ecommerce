"use client";
import { Carousel } from "@mantine/carousel";
import { AspectRatio, Modal, SimpleGrid, Stack } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { $Enums } from "@repo/database";
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
                <div className="w-full h-full">
                  <CustomImage
                    src={asset.url}
                    alt={`Product image ${index + 1}`}
                  />
                </div>
              </Carousel.Slide>
            ))}
          </Carousel>
        ) : (
          <Stack gap="md">
            <div className="cursor-pointer" onClick={() => handleImageClick(0)}>
              <CustomImage
                src={assets[0].url}
                className="rounded-lg"
                alt="Main product image"
              />
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
        <Modal.Root opened={opened} onClose={close} fullScreen radius={0}>
          <Modal.Overlay />

          <Modal.Content>
            <Modal.Body className="max-h-screen p-0 flex items-center justify-center relative">
              <Carousel
                withIndicators={false}
                withControls={true}
                className="w-full h-full"
                slideSize="100%"
                plugins={[Fade()]}
                emblaOptions={{
                  loop: true,
                  startIndex: selectedAssetIndex,
                }}
                classNames={{
                  control: styles.modalControl,
                  controls: styles.modalControls,
                }}
              >
                {assets.map((asset, index) => (
                  <Carousel.Slide key={index}>
                    <div className="w-full h-full flex items-center justify-center">
                      <AspectRatio miw="100vh" ratio={1} pos="relative">
                        <CustomImage
                          src={asset.url}
                          alt={`Product image ${index + 1}`}
                        />
                      </AspectRatio>
                    </div>
                  </Carousel.Slide>
                ))}
              </Carousel>
            </Modal.Body>
          </Modal.Content>
        </Modal.Root>
      )}
    </>
  );
};

export default ProductAssetViewer;
