import { z } from "zod";
import { colorHex, FontType } from "../../common";

export const mantineThemeSchema = z.object({
  primaryColor: colorHex,
  secondaryColor: colorHex.nullish(),
  primaryShade: z
    .number({
      error: "Ana renk tonunu belirtin",
    })
    .min(0, { error: "En az 0" })
    .max(9, { error: "En fazla 9" }),
  font: z.enum(Object.values(FontType), {
    error: "Font türünü belirtin",
  }),
});

export type MantineThemeSchema = z.infer<typeof mantineThemeSchema>;
