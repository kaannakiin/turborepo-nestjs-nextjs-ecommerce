import { MantineFontWeight, MantineSize, TextAlign } from "@repo/types";

export function getMantineSizeLabel(size: MantineSize): string {
  switch (size) {
    case MantineSize.xs:
      return "Ekstra Küçük";
    case MantineSize.sm:
      return "Küçük";
    case MantineSize.md:
      return "Orta";
    case MantineSize.lg:
      return "Büyük";
    case MantineSize.xl:
      return "Ekstra Büyük";
  }
}

export function getTextAlignLabel(align: TextAlign): string {
  switch (align) {
    case TextAlign.center:
      return "Ortala";
    case TextAlign.right:
      return "Sağa Hizala";
    case TextAlign.left:
      return "Sola Hizala";
  }
}

export function getMantineFontWeightLabel(weight: MantineFontWeight) {
  switch (weight) {
    case "thin":
      return "İnce";
    case "normal":
      return "Normal";
    case "bold":
      return "Kalın";
    case "extralight":
      return "Ekstra İnce";
    case "light":
      return "Hafif";
    case "semibold":
      return "Yarı Kalın";
    case "medium":
      return "Medium";
  }
}
