import { z } from "zod";
import { colorHex } from "../../../shared-schema";
import { FontType } from "../../../shared/shared-enum";

export const mantineThemeSchema = z.object({
  primaryColor: colorHex,
  secondaryColor: colorHex.nullish(),
  primaryShade: z
    .number({
      error: "Ana renk tonunu belirtin",
    })
    .min(0, { error: "En az 0" })
    .max(9, { error: "En fazla 9" }),
  font: z.literal<FontType>(FontType.Anton),
});

export type MantineThemeSchema = z.infer<typeof mantineThemeSchema>;
