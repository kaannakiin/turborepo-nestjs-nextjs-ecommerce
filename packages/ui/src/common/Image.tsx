"use client";

import {
  Image as MantineImage,
  ImageProps as MantineImageProps,
} from "@mantine/core";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { getExternalImageSrc } from "../lib/image-helpers";

type ImageProps = MantineImageProps & {
  enableProgressiveLoading?: boolean;
};

const Image = ({ enableProgressiveLoading = true, ...props }: ImageProps) => {
  const { src, className, style, ...restProps } = props;

  const [loadingState, setLoadingState] = useState<
    "thumbnail" | "original" | "error"
  >("thumbnail");
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);

  const thumbnailSrc =
    typeof src === "string" ? getExternalImageSrc(src) : null;
  const originalSrc = typeof src === "string" ? src : null;

  useEffect(() => {
    if (!enableProgressiveLoading || !originalSrc) {
      setCurrentSrc(originalSrc);
      setLoadingState("original");
      return;
    }

    setLoadingState("thumbnail");
    setCurrentSrc(thumbnailSrc);

    if (thumbnailSrc) {
      const thumbnailImg = new window.Image();
      thumbnailImg.src = thumbnailSrc;

      thumbnailImg.onload = () => {
        setCurrentSrc(thumbnailSrc);

        const originalImg = new window.Image();
        originalImg.src = originalSrc;

        originalImg.onload = () => {
          setLoadingState("original");
          setCurrentSrc(originalSrc);
        };

        originalImg.onerror = () => {
          setLoadingState("error");
        };
      };

      thumbnailImg.onerror = () => {
        setCurrentSrc(originalSrc);
        setLoadingState("original");
      };
    } else {
      setCurrentSrc(originalSrc);
      setLoadingState("original");
    }
  }, [src, thumbnailSrc, originalSrc, enableProgressiveLoading]);

  return (
    <div className="w-full h-full overflow-hidden relative">
      <MantineImage
        {...restProps}
        src={currentSrc}
        className={clsx(
          className,
          "transition-opacity duration-500 ease-in-out",
          {
            "opacity-70 blur-sm": loadingState === "thumbnail",
            "opacity-100 blur-0": loadingState === "original",
          },
        )}
        style={{
          ...style,
          willChange:
            loadingState === "thumbnail" ? "opacity, filter" : undefined,
        }}
      />
    </div>
  );
};

export default Image;
