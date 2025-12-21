"use client";
import { AspectRatio, Modal } from "@mantine/core";
import { useClickOutside, useHotkeys } from "@mantine/hooks";
import { AssetType } from "@repo/database/client";
import { IconPhoto, IconVideo, IconZoomIn } from "@tabler/icons-react";
import { useState } from "react";
import CustomImage from "../../components/CustomImage";

interface TableAssetProps {
  url?: string;
  type: AssetType;
  withModal?: boolean;
}

const TableAsset = ({ url, type, withModal = true }: TableAssetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const lightboxRef = useClickOutside(() => setIsOpen(false));

  useHotkeys([["Escape", () => setIsOpen(false)]]);

  if (type === "AUDIO" || type === "DOCUMENT") {
    return null;
  }

  const hasUrl = Boolean(url);

  if (!hasUrl) {
    return (
      <div className="relative w-full h-full min-h-16">
        <div className="w-full h-full p-4 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200/50">
          {type === "IMAGE" ? (
            <IconPhoto size={24} className="text-gray-300" />
          ) : (
            <IconVideo size={24} className="text-gray-300" />
          )}
        </div>
      </div>
    );
  }

  if (!withModal) {
    return (
      <div className="relative w-full h-full min-h-12 rounded-lg overflow-hidden bg-gray-100">
        {type === "IMAGE" ? (
          <CustomImage src={url} alt="Asset" />
        ) : (
          <video
            src={url}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
        )}
      </div>
    );
  }

  return (
    <>
      <div
        className="relative w-full h-full min-h-12 cursor-pointer group rounded-lg overflow-hidden bg-gray-100"
        onClick={() => setIsOpen(true)}
      >
        {type === "IMAGE" ? (
          <CustomImage
            src={url}
            alt="Asset"
            className="object-cover w-full h-full"
          />
        ) : (
          <video
            src={url}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <IconZoomIn size={20} className="text-white drop-shadow-lg" />
          </div>
        </div>
      </div>

      <Modal
        opened={isOpen}
        onClose={() => setIsOpen(false)}
        size="xl"
        centered
        withCloseButton
        radius="lg"
      >
        <AspectRatio
          ratio={1}
          pos={"relative"}
          className="h-[80vh] w-auto object-contain rounded-lg"
        >
          {type === "IMAGE" ? (
            <CustomImage src={url} alt="Asset - Enlarged" />
          ) : (
            <video
              src={url}
              className="w-full h-full object-contain rounded-lg"
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
