"use client";
import Image from "next/image";
import { useState } from "react";

interface CustomImageProps {
  alt?: string;
  src: string;
  className?: string;
  aspectRatio?: "square" | "portrait" | "landscape";
}

const CustomImage = ({
  alt = "Product image",
  src,
  className = "",
  aspectRatio = "square",
}: CustomImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "portrait":
        return "aspect-[3/4]";
      case "landscape":
        return "aspect-[4/3]";
      default:
        return "aspect-square";
    }
  };

  return (
    <div
      className={`relative w-full ${getAspectRatioClass()} overflow-hidden bg-gray-50 ${className}`}
    >
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 animate-spin"></div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
          <svg
            className="w-12 h-12 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs">Resim yüklenemedi</span>
        </div>
      )}

      {/* Thumbnail image (low quality, fast loading) */}
      <Image
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        alt={alt}
        src={src}
        className={`object-cover transition-opacity duration-200 ${
          isLoading ? "opacity-100 scale-110 blur-sm" : "opacity-0"
        }`}
        quality={10}
        priority={true}
        onError={() => setHasError(true)}
        loader={({ src, width }) => {
          const url = new URL(src);
          const pathname = url.pathname;
          const lastDotIndex = pathname.lastIndexOf(".");

          if (lastDotIndex === -1) {
            url.pathname = `${pathname}-thumbnail`;
          } else {
            const nameWithoutExt = pathname.substring(0, lastDotIndex);
            const extension = pathname.substring(lastDotIndex);
            url.pathname = `${nameWithoutExt}-thumbnail${extension}`;
          }

          // Add width parameter for better optimization
          url.searchParams.set("w", Math.min(width, 400).toString());
          return url.toString();
        }}
      />

      {!hasError && (
        <Image
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          alt={alt}
          src={src}
          className={`object-cover transition-all duration-300 ease-out ${
            isLoading ? "opacity-0 scale-105" : "opacity-100 scale-100"
          } hover:scale-105 hover:brightness-110`}
          quality={85}
          priority={false}
          onLoad={() => setIsLoading(false)}
          onError={() => setHasError(true)}
        />
      )}

      {/* Subtle gradient overlay for better text readability if needed */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200" />
    </div>
  );
};

export default CustomImage;
