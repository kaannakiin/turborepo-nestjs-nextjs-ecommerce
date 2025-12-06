export const SortAdminUserTable = {
  nameAsc: "NAME_ASC",
  nameDesc: "NAME_DESC",
  createdAtAsc: "CREATED_AT_ASC",
  createdAtDesc: "CREATED_AT_DESC",
} as const;
export type SortAdminUserTable =
  (typeof SortAdminUserTable)[keyof typeof SortAdminUserTable];

export const TextAlign = {
  left: "left",
  center: "center",
  right: "right",
};

export type TextAlign = (typeof TextAlign)[keyof typeof TextAlign];

export const MantineSize = {
  xs: "xs",
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
} as const;
export type MantineSize = (typeof MantineSize)[keyof typeof MantineSize];

export const MantineFontWeight = {
  thin: "thin",
  extralight: "extralight",
  light: "light",
  normal: "normal",
  medium: "medium",
  semibold: "semibold",
  bold: "bold",
} as const;

export type MantineFontWeight =
  (typeof MantineFontWeight)[keyof typeof MantineFontWeight];

export const FontFamily = {
  // Sistem fontları
  system:
    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mantineDefault:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",

  // Sans-serif fontlar
  inter: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  roboto: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  openSans:
    "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  lato: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  montserrat:
    "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  nunito: "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  poppins:
    "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  quicksand:
    "'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  raleway:
    "'Raleway', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

  // Serif fontlar
  timesNewRoman: "'Times New Roman', Times, serif",
  georgia: "Georgia, 'Times New Roman', Times, serif",
  playfairDisplay: "'Playfair Display', Georgia, 'Times New Roman', serif",
  merriweather: "'Merriweather', Georgia, 'Times New Roman', serif",
  crimsonText: "'Crimson Text', Georgia, 'Times New Roman', serif",

  // Monospace fontlar
  jetBrainsMono: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  firaCode: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
  sourceCodePro: "'Source Code Pro', Consolas, 'Courier New', monospace",
  courierNew: "'Courier New', Courier, monospace",

  // Cursive fontlar
  dancingScript: "'Dancing Script', cursive",
  greatVibes: "'Great Vibes', cursive",

  // Genel kategoriler (fallback)
  sansSerif: "sans-serif",
  serif: "serif",
  monospace: "monospace",
  cursive: "cursive",
} as const;

export type FontFamily = (typeof FontFamily)[keyof typeof FontFamily];

export const ThemeComponents = {
  SLIDER: "SLIDER",
  MARQUEE: "MARQUEE",
  PRODUCT_CAROUSEL: "PRODUCT_CAROUSEL",
} as const;

export type ThemeComponents =
  (typeof ThemeComponents)[keyof typeof ThemeComponents];

export const AspectRatio = {
  AUTO: "auto",
  SQUARE: "1/1",
  FOUR_BY_THREE: "4/3",
  THREE_BY_FOUR: "3/4", // Portre (Instagram Story vb.)
  SIXTEEN_BY_NINE: "16/9",
  NINE_BY_SIXTEEN: "9/16", // Dikey Video (TikTok, Reels)
  TWENTY_ONE_BY_NINE: "21/9", // Ultra-wide
  TWO_BY_ONE: "2/1", // Panorama
  THREE_BY_TWO: "3/2", // Klasik Fotoğraf
  TWO_BY_THREE: "2/3", // Portre Fotoğraf
  FIVE_BY_FOUR: "5/4", // Klasik Monitor
  FOUR_BY_FIVE: "4/5", // Instagram Portre
} as const;

export type AspectRatio = (typeof AspectRatio)[keyof typeof AspectRatio];
