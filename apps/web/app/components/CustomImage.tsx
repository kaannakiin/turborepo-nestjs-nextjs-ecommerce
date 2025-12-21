"use client";
import NextImage from "next/image";
import { Image as MantineImage } from "@mantine/core";
import { MouseEventHandler, useState, useMemo } from "react";

interface CustomImageProps {
  alt?: string;
  src: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement> | undefined;
  priority?: boolean;
}

const CustomImage = ({
  alt = "Product image",
  src,
  className = "",
  onClick,
  priority = false,
}: CustomImageProps) => {
  const [isLoading, setIsLoading] = useState(true);

  const IGNORED_HOSTS = ["placehold.co"];

  const isIgnoredHost = useMemo(() => {
    if (!src) return false;
    try {
      const url = new URL(src);
      return IGNORED_HOSTS.includes(url.hostname);
    } catch {
      return false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  if (isIgnoredHost) {
    return (
      <MantineImage
        src={src}
        alt={alt}
        className={className}
        onClick={onClick}
      />
    );
  }

  const getThumbnailSrc = (originalSrc: string): string | null => {
    if (!originalSrc) return null;

    try {
      const pathSegments = originalSrc.split(".");
      if (pathSegments.length > 1) {
        const base = pathSegments.join(".");
        return `${base}-thumbnail.webp`;
      }

      return originalSrc.replace(/\.[^/.]+$/, "-thumbnail.webp");
    } catch (e) {
      return originalSrc.replace(/\.[^/.]+$/, "-thumbnail.webp");
    }
  };

  const thumbnailSrc = getThumbnailSrc(src);
  const showThumbnail = thumbnailSrc !== null;

  return (
    <div className={`relative w-full ${className}`} onClick={onClick}>
      {showThumbnail && (
        <NextImage
          alt={alt}
          src={thumbnailSrc as string}
          fill
          className={`
            object-contain 
            filter blur-xl 
            transition-opacity duration-700 ease-in-out
            ${isLoading ? "opacity-100" : "opacity-0"}
          `}
        />
      )}

      <NextImage
        alt={alt}
        src={src}
        fill
        priority={priority}
        onLoad={() => setIsLoading(false)}
        className={`
          object-contain 
          transition-all duration-500 ease-in-out
          ${
            !showThumbnail || isLoading
              ? "opacity-0 scale-95 grayscale"
              : "opacity-100 scale-100 grayscale-0"
          }
        `}
      />
    </div>
  );
};

export default CustomImage;
