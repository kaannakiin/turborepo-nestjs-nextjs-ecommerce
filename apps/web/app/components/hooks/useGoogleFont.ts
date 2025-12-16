import { useEffect } from "react";

const GOOGLE_FONTS_BASE_URL = "https://fonts.googleapis.com/css2";

const fontUrlMap: Record<string, string> = {
  Inter: "Inter:wght@300;400;500;600;700",
  Roboto: "Roboto:wght@300;400;500;700",
  Open_Sans: "Open+Sans:wght@300;400;500;600;700",
  Lato: "Lato:wght@300;400;700",
  Poppins: "Poppins:wght@300;400;500;600;700",
  Montserrat: "Montserrat:wght@300;400;500;600;700",
  Nunito: "Nunito:wght@300;400;500;600;700",
  Nunito_Sans: "Nunito+Sans:wght@300;400;500;600;700",
  Raleway: "Raleway:wght@300;400;500;600;700",
  Work_Sans: "Work+Sans:wght@300;400;500;600;700",
  Outfit: "Outfit:wght@300;400;500;600;700",
  Manrope: "Manrope:wght@300;400;500;600;700",
  Plus_Jakarta_Sans: "Plus+Jakarta+Sans:wght@300;400;500;600;700",
  DM_Sans: "DM+Sans:wght@300;400;500;600;700",
  Space_Grotesk: "Space+Grotesk:wght@300;400;500;600;700",
  Geist: "Geist:wght@300;400;500;600;700",

  Playfair_Display: "Playfair+Display:wght@400;500;600;700",
  Merriweather: "Merriweather:wght@300;400;700",
  Lora: "Lora:wght@400;500;600;700",
  Crimson_Text: "Crimson+Text:wght@400;600;700",
  Libre_Baskerville: "Libre+Baskerville:wght@400;700",
  Source_Serif_4: "Source+Serif+4:wght@300;400;500;600;700",
  Cormorant: "Cormorant:wght@300;400;500;600;700",

  Roboto_Mono: "Roboto+Mono:wght@400;500;600;700",
  Fira_Code: "Fira+Code:wght@400;500;600;700",
  JetBrains_Mono: "JetBrains+Mono:wght@400;500;600;700",
  Source_Code_Pro: "Source+Code+Pro:wght@400;500;600;700",
  IBM_Plex_Mono: "IBM+Plex+Mono:wght@400;500;600",
  Geist_Mono: "Geist+Mono:wght@400;500;600;700",

  Oswald: "Oswald:wght@300;400;500;600;700",
  Bebas_Neue: "Bebas+Neue",
  Anton: "Anton",
  Archivo_Black: "Archivo+Black",

  Ubuntu: "Ubuntu:wght@300;400;500;700",
  Rubik: "Rubik:wght@300;400;500;600;700",
  Quicksand: "Quicksand:wght@300;400;500;600;700",
  Comfortaa: "Comfortaa:wght@300;400;500;600;700",
};

export const fontFamilyMap: Record<string, string> = {
  Inter: "'Inter', sans-serif",
  Roboto: "'Roboto', sans-serif",
  Open_Sans: "'Open Sans', sans-serif",
  Lato: "'Lato', sans-serif",
  Poppins: "'Poppins', sans-serif",
  Montserrat: "'Montserrat', sans-serif",
  Nunito: "'Nunito', sans-serif",
  Nunito_Sans: "'Nunito Sans', sans-serif",
  Raleway: "'Raleway', sans-serif",
  Work_Sans: "'Work Sans', sans-serif",
  Outfit: "'Outfit', sans-serif",
  Manrope: "'Manrope', sans-serif",
  Plus_Jakarta_Sans: "'Plus Jakarta Sans', sans-serif",
  DM_Sans: "'DM Sans', sans-serif",
  Space_Grotesk: "'Space Grotesk', sans-serif",
  Geist: "'Geist', sans-serif",

  Playfair_Display: "'Playfair Display', serif",
  Merriweather: "'Merriweather', serif",
  Lora: "'Lora', serif",
  Crimson_Text: "'Crimson Text', serif",
  Libre_Baskerville: "'Libre Baskerville', serif",
  Source_Serif_4: "'Source Serif 4', serif",
  Cormorant: "'Cormorant', serif",

  Roboto_Mono: "'Roboto Mono', monospace",
  Fira_Code: "'Fira Code', monospace",
  JetBrains_Mono: "'JetBrains Mono', monospace",
  Source_Code_Pro: "'Source Code Pro', monospace",
  IBM_Plex_Mono: "'IBM Plex Mono', monospace",
  Geist_Mono: "'Geist Mono', monospace",

  Oswald: "'Oswald', sans-serif",
  Bebas_Neue: "'Bebas Neue', sans-serif",
  Anton: "'Anton', sans-serif",
  Archivo_Black: "'Archivo Black', sans-serif",

  Ubuntu: "'Ubuntu', sans-serif",
  Rubik: "'Rubik', sans-serif",
  Quicksand: "'Quicksand', sans-serif",
  Comfortaa: "'Comfortaa', sans-serif",
};

export const getFontFamily = (fontKey?: string | null): string => {
  if (!fontKey) return fontFamilyMap.Inter;
  return fontFamilyMap[fontKey] ?? fontFamilyMap.Inter;
};

export const useGoogleFonts = (
  fontKeys: string | null | undefined | (string | null | undefined)[]
) => {
  useEffect(() => {
    if (!document.getElementById("google-fonts-preconnect")) {
      const preconnectApi = document.createElement("link");
      preconnectApi.id = "google-fonts-preconnect";
      preconnectApi.rel = "preconnect";
      preconnectApi.href = "https://fonts.googleapis.com";

      const preconnectGstatic = document.createElement("link");
      preconnectGstatic.id = "google-fonts-gstatic";
      preconnectGstatic.rel = "preconnect";
      preconnectGstatic.href = "https://fonts.gstatic.com";
      preconnectGstatic.crossOrigin = "anonymous";

      document.head.appendChild(preconnectApi);
      document.head.appendChild(preconnectGstatic);
    }

    const keysArray = Array.isArray(fontKeys) ? fontKeys : [fontKeys];

    const validKeys = keysArray.filter(
      (key): key is string => !!key && !!fontUrlMap[key]
    );

    validKeys.forEach((fontKey) => {
      const linkId = `google-font-${fontKey}`;

      if (document.getElementById(linkId)) return;

      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = `${GOOGLE_FONTS_BASE_URL}?family=${fontUrlMap[fontKey]}&display=swap`;

      document.head.appendChild(link);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Array.isArray(fontKeys) ? fontKeys.join(",") : fontKeys]);
};
