"use client";
import { LoadingOverlay, LoadingOverlayProps } from "@mantine/core";
import { usePathname } from "next/navigation";

type GlobalLoadingOverlayProps = Omit<LoadingOverlayProps, "zIndex" | "overlayProps" | "loaderProps">;
const GlobalLoadingOverlay = ({ ...props }: GlobalLoadingOverlayProps) => {
  const pathname = usePathname();

  return (
    <LoadingOverlay
      {...props}
      visible
      zIndex={1000}
      overlayProps={{
        pos: "fixed",
        radius: "sm",
        blur: 2,
        style: {
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        },
      }}
      loaderProps={{
        color: pathname.includes("admin") ? "admin" : "primary",
        type: "bars",
      }}
    />
  );
};

export default GlobalLoadingOverlay;
