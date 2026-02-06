import {
  AspectRatio,
  MantineFontWeight,
  MantineSize,
  TextAlign,
} from "@repo/types";

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

export const getAspectRatioLabel = (ratio: AspectRatio): string => {
  switch (ratio) {
    case AspectRatio.AUTO:
      return "Otomatik";
    case AspectRatio["1/1"]:
      return "Kare (1:1)";
    case AspectRatio["4/3"]:
      return "4:3";
    case AspectRatio["16/9"]:
      return "16:9";
    case AspectRatio["9/16"]:
      return "9:16";
    case AspectRatio["21/9"]:
      return "21:9";
    case AspectRatio["3/2"]:
      return "3:2";
    case AspectRatio["2/3"]:
      return "2:3";
    case AspectRatio["3/4"]:
      return "3:4";
    case AspectRatio["4/5"]:
      return "4:5";
    case AspectRatio["5/4"]:
      return "5:4";
    case AspectRatio["5/7"]:
      return "5:7";
    case AspectRatio["7/5"]:
      return "7:5";
    case AspectRatio["8/5"]:
      return "8:5";
    case AspectRatio["5/8"]:
      return "5:8";
    case AspectRatio["16/10"]:
      return "16:10";
    case AspectRatio["10/16"]:
      return "10:16";
    case AspectRatio["21/10"]:
      return "21:10";
    case AspectRatio["10/21"]:
      return "10:21";
    default:
      return ratio;
  }
};

export const getAspectRatioValue = (ratio: AspectRatio): number => {
  switch (ratio) {
    case AspectRatio.AUTO:
      return 1;
    case AspectRatio["1/1"]:
      return 1;
    case AspectRatio["4/3"]:
      return 4 / 3;
    case AspectRatio["16/9"]:
      return 16 / 9;
    case AspectRatio["9/16"]:
      return 9 / 16;
    case AspectRatio["21/9"]:
      return 21 / 9;
    case AspectRatio["3/2"]:
      return 3 / 2;
    case AspectRatio["2/3"]:
      return 2 / 3;
    case AspectRatio["3/4"]:
      return 3 / 4;
    case AspectRatio["4/5"]:
      return 4 / 5;
    case AspectRatio["5/4"]:
      return 5 / 4;
    case AspectRatio["5/7"]:
      return 5 / 7;
    case AspectRatio["7/5"]:
      return 7 / 5;
    case AspectRatio["8/5"]:
      return 8 / 5;
    case AspectRatio["5/8"]:
      return 5 / 8;
    case AspectRatio["16/10"]:
      return 16 / 10;
    case AspectRatio["10/16"]:
      return 10 / 16;
    case AspectRatio["21/10"]:
      return 21 / 10;
    case AspectRatio["10/21"]:
      return 10 / 21;
    default:
      return 1;
  }
};
