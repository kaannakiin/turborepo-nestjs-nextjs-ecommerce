"use client";
import { AspectRatio, Modal } from "@mantine/core";
import { $Enums } from "@repo/types";
import { IconPhoto, IconSearch, IconVideo } from "@tabler/icons-react";
import { useState } from "react";
import CustomImage from "../../components/CustomImage";

interface TableAssetProps {
  url?: string;
  type: $Enums.AssetType;
}

const TableAsset = ({ url, type }: TableAssetProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (type === "AUDIO" || type === "DOCUMENT") {
    return null;
  }

  const hasUrl = Boolean(url);

  const handleClick = () => {
    if (hasUrl) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // URL yoksa fallback UI
  if (!hasUrl) {
    return (
      <div className="relative w-full h-full min-h-16">
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
          {type === "IMAGE" ? (
            <>
              <IconPhoto size={32} className="text-gray-300 mb-2" />
              <span className="text-gray-400 text-xs">Görsel Yok</span>
            </>
          ) : (
            <>
              <IconVideo size={32} className="text-gray-300 mb-2" />
              <span className="text-gray-400 text-xs">Video Yok</span>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="relative w-full h-full min-h-12 cursor-pointer group"
        onClick={handleClick}
      >
        {type === "IMAGE" ? (
          <AspectRatio ratio={1} pos={"relative"}>
            <CustomImage src={url} alt="Asset" />
          </AspectRatio>
        ) : (
          <video
            src={url}
            className="w-full h-full object-contain rounded-lg"
            muted
            playsInline
          />
        )}

        <div className="absolute inset-0 hover:bg-gray-500 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center ">
          <IconSearch
            className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            size={24}
          />
        </div>
      </div>

      <Modal
        opened={isModalOpen}
        onClose={handleCloseModal}
        size="xl"
        centered
        withCloseButton
        overlayProps={{
          backgroundOpacity: 0.8,
          blur: 3,
        }}
      >
        <AspectRatio
          ratio={1}
          className="relative"
          style={{ minHeight: "60vh" }}
        >
          {type === "IMAGE" ? (
            <CustomImage src={url} alt="Asset - Enlarged" />
          ) : (
            <video
              src={url}
              className="w-full h-full object-contain"
              controls
              autoPlay
            />
          )}
        </AspectRatio>
      </Modal>
    </>
  );
};

export default TableAsset;
