import { LoadingOverlay, LoadingOverlayProps } from "@mantine/core";
import { usePathname } from "next/navigation";

type GlobalLoadingOverlayProps = Omit<
  LoadingOverlayProps,
  "zIndex" | "overlayProps" | "loaderProps"
>;
const GlobalLoadingOverlay = ({ ...props }: GlobalLoadingOverlayProps) => {
  const pathname = usePathname();

  return (
    <LoadingOverlay
      {...props}
      visible
      zIndex={1000}
      overlayProps={{ radius: "sm", blur: 2 }}
      loaderProps={{
        color: pathname.includes("admin") ? "admin" : "primary",
        type: "bars",
      }}
    />
  );
};

export default GlobalLoadingOverlay;
