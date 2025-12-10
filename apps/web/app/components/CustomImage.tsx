"use client";
import NextImage from "next/image";
import { Image as MantineImage } from "@mantine/core";
import { MouseEventHandler, useState, useMemo, CSSProperties } from "react";

interface CustomImageProps {
  alt?: string;
  src: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement> | undefined;
  priority?: boolean;
  style?: CSSProperties | undefined;
}

const CustomImage = ({
  alt = "Product image",
  src,
  className = "",
  onClick,
  priority = false,
  style,
}: CustomImageProps) => {
  const [isLoading, setIsLoading] = useState(true);

  const IGNORED_HOSTS = ["placehold.co"];

  const isIgnoredHost = useMemo(() => {
    if (!src) return false;
    try {
      const url = new URL(src);
      return (
        IGNORED_HOSTS.includes(url.hostname) ||
        (typeof Blob !== "undefined" && url.protocol === "blob:")
      );
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
        style={style}
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
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={style}
          className={`
            object-contain 
            filter blur-xl scale-110 
            transition-opacity duration-700 ease-in-out
            ${isLoading ? "opacity-100" : "opacity-0"}
          `}
        />
      )}

      <NextImage
        alt={alt}
        src={src}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        style={style}
        priority={priority}
        onLoad={() => setIsLoading(false)}
        loading="eager"
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
