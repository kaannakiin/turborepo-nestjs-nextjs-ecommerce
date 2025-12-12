import { Media } from "@/context/theme-context/ThemeContext";
import { AssetType } from "@repo/database/client";
import { SliderComponentOutputType } from "@repo/types";

const getAssetTypeFromFile = (file: File): AssetType => {
  if (file.type.startsWith("video/")) return "VIDEO";
  if (file.type.startsWith("audio/")) return "AUDIO";

  return "IMAGE";
};

export function convertAssetToRenderImage(
  data: SliderComponentOutputType["sliders"],
  media: Media
): Array<{ url: string; alt?: string; type: AssetType }> | null {
  if (!data) return null;

  const slides = data
    .map((item) => {
      let targetView = item.desktopView;
      if (media === "mobile") {
        targetView = item.mobileView ? item.mobileView : item.desktopView;
      } else if (media === "tablet") {
        targetView = item.desktopView;
      }
      if (!targetView) return null;

      if (targetView.file) {
        return {
          url: URL.createObjectURL(targetView.file),
          type: getAssetTypeFromFile(targetView.file),
          alt: `Slider ${item.order ?? ""}`,
        };
      }

      if (targetView.existingAsset) {
        return {
          url: targetView.existingAsset.url,
          type: targetView.existingAsset.type,
          alt: `Slider ${item.order ?? ""}`,
        };
      }

      return null;
    })

    .filter(
      (slide): slide is { url: string; alt: string; type: AssetType } =>
        slide !== null
    );

  return slides;
}
