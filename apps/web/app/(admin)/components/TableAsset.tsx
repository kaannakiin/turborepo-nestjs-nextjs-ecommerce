"use client";
import { useState } from "react";
import { Modal } from "@mantine/core";
import Image from "next/image";
import { $Enums } from "@repo/types";
import { IconSearch, IconPhoto, IconVideo } from "@tabler/icons-react";

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

  // URL varsa tam özellikli component
  return (
    <>
      <div
        className="relative w-full h-full min-h-16 cursor-pointer group"
        onClick={handleClick}
      >
        {type === "IMAGE" ? (
          <Image
            src={url}
            alt="Asset"
            fill
            className="object-contain rounded-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <video
            src={url}
            className="w-full h-full object-contain rounded-lg"
            muted
            playsInline
          />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 hover:bg-gray-100 bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center rounded-lg">
          <IconSearch
            className="text-white group-hover:text-black opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
        <div className="relative w-full" style={{ minHeight: "60vh" }}>
          {type === "IMAGE" ? (
            <Image
              src={url}
              alt="Asset - Enlarged"
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          ) : (
            <video
              src={url}
              className="w-full h-full object-contain"
              controls
              autoPlay
            />
          )}
        </div>
      </Modal>
    </>
  );
};

export default TableAsset;
