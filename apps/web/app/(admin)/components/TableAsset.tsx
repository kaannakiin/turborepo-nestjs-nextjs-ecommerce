"use client";
import { AspectRatio, Modal } from "@mantine/core";
import { AssetType } from "@repo/database/client";
import { IconPhoto, IconVideo, IconZoomIn } from "@tabler/icons-react";
import { lazy, Suspense, useState } from "react";
import CustomImage from "../../components/CustomImage";

interface TableAssetProps {
  url?: string;
  type: AssetType;
  withModal?: boolean;
}

const AssetModal = lazy(() =>
  Promise.resolve({
    default: ({
      isOpen,
      onClose,
      url,
      type,
    }: {
      isOpen: boolean;
      onClose: () => void;
      url: string;
      type: AssetType;
    }) => (
      <Modal
        opened={isOpen}
        onClose={onClose}
        size="xl"
        centered
        withCloseButton
        radius="lg"
        overlayProps={{
          backgroundOpacity: 0.85,
          blur: 8,
        }}
        styles={{
          content: {
            backgroundColor: "transparent",
            boxShadow: "none",
          },
          header: {
            backgroundColor: "transparent",
          },
          close: {
            color: "white",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.1)",
            },
          },
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
              className="w-full h-full object-contain rounded-lg"
              controls
              autoPlay
            />
          )}
        </AspectRatio>
      </Modal>
    ),
  })
);

const TableAsset = ({ url, type, withModal = true }: TableAssetProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (type === "AUDIO" || type === "DOCUMENT") {
    return null;
  }

  const hasUrl = Boolean(url);

  const handleClick = () => {
    if (hasUrl && withModal) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (!hasUrl) {
    return (
      <div className="relative w-full h-full min-h-16">
        <div className="w-full h-full p-4 flex flex-col items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200/50 shadow-sm">
          {type === "IMAGE" ? (
            <IconPhoto size={24} className="text-gray-400" />
          ) : (
            <IconVideo size={24} className="text-gray-400" />
          )}
        </div>
      </div>
    );
  }

  if (!withModal) {
    return (
      <div className="relative w-full h-full min-h-12 rounded-xl overflow-hidden">
        {type === "IMAGE" ? (
          <AspectRatio ratio={1} pos="relative">
            <CustomImage src={url} alt="Asset" />
          </AspectRatio>
        ) : (
          <video
            src={url}
            className="w-full h-full object-contain rounded-xl"
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
        className="relative w-full h-full min-h-12 cursor-pointer group overflow-hidden rounded-xl"
        onClick={handleClick}
      >
        <div className="transition-transform duration-300 ease-out group-hover:scale-105">
          {type === "IMAGE" ? (
            <AspectRatio ratio={1} pos="relative">
              <CustomImage src={url} alt="Asset" />
            </AspectRatio>
          ) : (
            <video
              src={url}
              className="w-full h-full object-contain rounded-xl"
              muted
              playsInline
            />
          )}
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg transform scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 ease-out delay-75">
              <IconZoomIn size={20} className="text-white drop-shadow-md" />
            </div>
          </div>
        </div>
        <div className="absolute inset-0 rounded-xl ring-0 ring-white/0 group-hover:ring-2 group-hover:ring-white/30 transition-all duration-300 pointer-events-none" />
      </div>

      {isModalOpen && (
        <Suspense fallback={null}>
          <AssetModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            url={url!}
            type={type}
          />
        </Suspense>
      )}
    </>
  );
};

export default TableAsset;
