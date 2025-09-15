"use client";
import Image from "next/image";
import { MouseEventHandler, useState } from "react";
import GlobalLoadingOverlay from "./GlobalLoadingOverlay";

interface CustomImageProps {
  alt?: string;
  src: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement> | undefined;
}

const CustomImage = ({
  alt = "Product image",
  src,
  className = "",
  onClick,
}: CustomImageProps) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative w-full overflow-hidden bg-gray-50 ${className}`}>
      {isLoading && <GlobalLoadingOverlay />}

      <Image
        fill
        alt={alt}
        src={src}
        quality={100}
        className={`object-cover transition-opacity duration-200 ${
          isLoading ? "opacity-100 scale-110 blur-sm" : "opacity-0"
        }`}
        onClick={onClick}
        priority={true}
        sizes="100vw"
        loader={({ src }) => {
          const url = new URL(src);
          const pathname = url.pathname;
          const lastDotIndex = pathname.lastIndexOf(".");

          if (lastDotIndex === -1) {
            url.pathname = `${pathname}-thumbnail`;
          } else {
            const nameWithoutExt = pathname.substring(0, lastDotIndex);
            url.pathname = `${nameWithoutExt}-thumbnail.webp`;
          }

          return url.toString();
        }}
      />

      <Image
        fill
        alt={alt}
        src={src}
        onClick={onClick}
        quality={100}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={`object-cover transition-all duration-300 ease-out ${
          isLoading ? "opacity-0 scale-105" : "opacity-100 scale-100"
        }`}
        priority={false}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};

export default CustomImage;
