"use client";
import NextImage from "next/image";
import { Image as MantineImage } from "@mantine/core";
import { MouseEventHandler, useState, useMemo, useEffect } from "react";

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

  useEffect(() => {
    setIsLoading(true);
  }, [src]);

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
      const lastDotIndex = originalSrc.lastIndexOf(".");
      if (lastDotIndex === -1) return null;

      const base = originalSrc.substring(0, lastDotIndex);
      return `${base}-thumbnail.webp`;
    } catch {
      return null;
    }
  };

  const thumbnailSrc = getThumbnailSrc(src);
  const showThumbnail = thumbnailSrc !== null;

  return (
    <div
      className={`relative overflow-hidden  w-full h-full ${className}`}
      onClick={onClick}
      style={{ minHeight: "100%" }} // Parent'tan height almasını sağla
    >
      {showThumbnail && (
        <NextImage
          alt={alt}
          src={thumbnailSrc as string}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
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
        sizes="(max-width: 768px) 100vw, 50vw"
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
