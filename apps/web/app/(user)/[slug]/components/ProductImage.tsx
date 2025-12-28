// components/ProductImage.tsx (aynı klasörde olabilir)
"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface ProductImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

const getThumbnailUrl = (url: string): string => {
  const lastDotIndex = url.lastIndexOf(".");
  if (lastDotIndex === -1) return url;

  const basePath = url.substring(0, lastDotIndex);
  return `${basePath}-thumbnail.webp`;
};

const ProductImage = ({ src, alt, priority = false }: ProductImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const thumbnailUrl = getThumbnailUrl(src);

  useEffect(() => {
    setIsLoading(true);
  }, [src]);

  return (
    <>
      {/* Thumbnail - blur placeholder */}
      <Image
        src={thumbnailUrl}
        alt={alt}
        fill
        className={`
          object-contain blur-xl transition-opacity duration-500
          ${isLoading ? "opacity-100" : "opacity-0"}
        `}
      />

      {/* Main image */}
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, 50vw"
        onLoad={() => setIsLoading(false)}
        className={`
          object-contain transition-all duration-500
          ${isLoading ? "opacity-0 scale-95" : "opacity-100 scale-100"}
        `}
      />
    </>
  );
};

export default ProductImage;
