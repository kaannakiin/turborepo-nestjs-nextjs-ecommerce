import * as z from "zod";
export const colorHex = z
  .string({
    error: "Renk kodu zorunludur.",
  })
  .regex(/^#([A-Fa-f0-9]{6})$/, {
    error: "Geçersiz renk kodu. Hex formatında olmalıdır.",
  });
