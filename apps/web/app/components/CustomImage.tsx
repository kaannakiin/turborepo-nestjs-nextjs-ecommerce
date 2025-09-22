"use client";
import { Image } from "@mantine/core";
import { MouseEventHandler } from "react";
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
  return (
    <div className={`relative w-full overflow-hidden bg-gray-50 ${className}`}>
      <Image
        alt={alt}
        src={src}
        onClick={onClick}
        className={`w-full h-full object-contain `}
      />
    </div>
  );
};

export default CustomImage;
