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

export const ThemeSections = {
  HEADER: "HEADER",
  FOOTER: "FOOTER",
};
export type ThemeSections = (typeof ThemeSections)[keyof typeof ThemeSections];

export const ThemePages = {
  HOMEPAGE: "HOMEPAGE",
  PRODUCT: "PRODUCT",
} as const;

export type ThemePages = (typeof ThemePages)[keyof typeof ThemePages];

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

export const FontType = {
  Inter: "Inter",
  Roboto: "Roboto",
  Open_Sans: "Open Sans",
  Lato: "Lato",
  Poppins: "Poppins",
  Montserrat: "Montserrat",
  Nunito: "Nunito",
  Nunito_Sans: "Nunito Sans",
  Raleway: "Raleway",
  Work_Sans: "Work Sans",
  Outfit: "Outfit",
  Manrope: "Manrope",
  Plus_Jakarta_Sans: "Plus Jakarta Sans",
  DM_Sans: "DM Sans",
  Space_Grotesk: "Space Grotesk",
  Geist: "Geist",
  // Serif
  Playfair_Display: "Playfair Display",
  Merriweather: "Merriweather",
  Lora: "Lora",
  Crimson_Text: "Crimson Text",
  Libre_Baskerville: "Libre Baskerville",
  Source_Serif_4: "Source Serif 4",
  Cormorant: "Cormorant",
  // Monospace
  Roboto_Mono: "Roboto Mono",
  Fira_Code: "Fira Code",
  JetBrains_Mono: "JetBrains Mono",
  Source_Code_Pro: "Source Code Pro",
  IBM_Plex_Mono: "IBM Plex Mono",
  Geist_Mono: "Geist Mono",
  // Display
  Oswald: "Oswald",
  Bebas_Neue: "Bebas Neue",
  Anton: "Anton",
  Archivo_Black: "Archivo Black",
  // Turkish Support
  Ubuntu: "Ubuntu",
  Rubik: "Rubik",
  Quicksand: "Quicksand",
  Comfortaa: "Comfortaa",
} as const;

export type FontType = (typeof FontType)[keyof typeof FontType];
// Zod enum için
export const fontKeys = Object.keys(FontType) as [string, ...string[]];

export const ProductBulkAction = {
  activate: "activate",
  deactivate: "deactivate",
  delete: "delete",
  "assign-category": "assign-category",
  "remove-category": "remove-category",
  "assign-brand": "assign-brand",
  "assign-taxonomy": "assign-taxonomy",
  "assign-tags": "assign-tags",
  "remove-tags": "remove-tags",
  "update-price-percent": "update-price-percent",
  "update-price-fixed": "update-price-fixed",
  "update-stock": "update-stock",
  "inventory-track-on": "inventory-track-on",
  "inventory-track-off": "inventory-track-off",
  "inventory-allow-negative": "inventory-allow-negative",
  "inventory-deny-negative": "inventory-deny-negative",
  "assign-supplier": "assign-supplier",
  "print-barcode": "print-barcode",
  "export-excel": "export-excel",
} as const;

export type ProductBulkAction =
  (typeof ProductBulkAction)[keyof typeof ProductBulkAction];

export const DayOfWeek = {
  SUNDAY: "SUNDAY",
  MONDAY: "MONDAY",
  TUESDAY: "TUESDAY",
  WEDNESDAY: "WEDNESDAY",
  THURSDAY: "THURSDAY",
  FRIDAY: "FRIDAY",
  SATURDAY: "SATURDAY",
} as const;

export type DayOfWeek = (typeof DayOfWeek)[keyof typeof DayOfWeek];

export const NumericOperators = {
  EQUAL: "EQUAL",
  NOT_EQUAL: "NOT_EQUAL",
  GREATER_THAN: "GREATER_THAN",
  LESS_THAN: "LESS_THAN",
  GREATER_THAN_OR_EQUAL: "GREATER_THAN_OR_EQUAL",
  LESS_THAN_OR_EQUAL: "LESS_THAN_OR_EQUAL",
  BETWEEN: "BETWEEN",
} as const;
export type NumericOperators =
  (typeof NumericOperators)[keyof typeof NumericOperators];

export const ArrayOperators = {
  IN: "IN",
  NOT_IN: "NOT_IN",
} as const;

export type ArrayOperators =
  (typeof ArrayOperators)[keyof typeof ArrayOperators];

export const ContainsOperators = {
  IN: "IN",
  NOT_IN: "NOT_IN",
  CONTAINS: "CONTAINS",
  NOT_CONTAINS: "NOT_CONTAINS",
} as const;
export type ContainsOperators =
  (typeof ContainsOperators)[keyof typeof ContainsOperators];

export const EqualityOperators = {
  EQUALS: "EQUALS",
  NOT_EQUALS: "NOT_EQUALS",
  IN: "IN",
  NOT_IN: "NOT_IN",
} as const;

export type EqualityOperators =
  (typeof EqualityOperators)[keyof typeof EqualityOperators];

export const ShippingMethod = {
  STANDARD: "STANDARD",
  EXPRESS: "EXPRESS",
  SAME_DAY: "SAME_DAY",
  PICKUP: "PICKUP",
} as const;

export type ShippingMethod =
  (typeof ShippingMethod)[keyof typeof ShippingMethod];

// packages/types/src/fulfillment/enums.ts

// 2. Aksiyon tipi - rules JSON içinde kullanılacak
export const FulfillmentActionType = {
  USE_LOCATION: "USE_LOCATION",
  EXCLUDE_LOCATION: "EXCLUDE_LOCATION",
  PREFER_LOCATION: "PREFER_LOCATION",
  ALLOW_SPLIT: "ALLOW_SPLIT",
  DENY_SPLIT: "DENY_SPLIT",
  USE_DROPSHIP: "USE_DROPSHIP",
  BACKORDER: "BACKORDER",
  REJECT: "REJECT",
  FLAG_FOR_REVIEW: "FLAG_FOR_REVIEW",
} as const;
export type FulfillmentActionType =
  (typeof FulfillmentActionType)[keyof typeof FulfillmentActionType];

// 3. Koşul field'ları - rules JSON içinde kullanılacak
export const FulfillmentConditionField = {
  // Customer
  CUSTOMER_TYPE: "CUSTOMER_TYPE",
  CUSTOMER_GROUP: "CUSTOMER_GROUP",
  // Order
  ORDER_TOTAL: "ORDER_TOTAL",
  ORDER_ITEM_COUNT: "ORDER_ITEM_COUNT",
  ORDER_WEIGHT: "ORDER_WEIGHT",
  ORDER_CURRENCY: "ORDER_CURRENCY",
  // Product
  PRODUCT_TAG: "PRODUCT_TAG",
  PRODUCT_CATEGORY: "PRODUCT_CATEGORY",
  PRODUCT_BRAND: "PRODUCT_BRAND",
  // Shipping
  SHIPPING_METHOD: "SHIPPING_METHOD",
  DESTINATION_COUNTRY: "DESTINATION_COUNTRY",
  DESTINATION_STATE: "DESTINATION_STATE",
  DESTINATION_CITY: "DESTINATION_CITY",
  // Inventory
  STOCK_LEVEL: "STOCK_LEVEL",
  LOCATION_TYPE: "LOCATION_TYPE",
  SUPPLIER_LEAD_TIME: "SUPPLIER_LEAD_TIME",
  // Time
  DAY_OF_WEEK: "DAY_OF_WEEK",
  TIME_OF_DAY: "TIME_OF_DAY",
  IS_HOLIDAY: "IS_HOLIDAY",
} as const;
export type FulfillmentConditionField =
  (typeof FulfillmentConditionField)[keyof typeof FulfillmentConditionField];

// 4. Condition operatörleri - tüm rule sistemlerinde ortak
export const ConditionOperator = {
  // Comparison
  EQ: "EQ",
  NEQ: "NEQ",
  GT: "GT",
  GTE: "GTE",
  LT: "LT",
  LTE: "LTE",
  // Array
  IN: "IN",
  NOT_IN: "NOT_IN",
  // Range
  BETWEEN: "BETWEEN",
  // String
  CONTAINS: "CONTAINS",
  NOT_CONTAINS: "NOT_CONTAINS",
  STARTS_WITH: "STARTS_WITH",
  ENDS_WITH: "ENDS_WITH",
  IS_EMPTY: "IS_EMPTY",
  IS_NOT_EMPTY: "IS_NOT_EMPTY",
  // Relation
  HAS_ANY: "HAS_ANY",
  HAS_ALL: "HAS_ALL",
  HAS_NONE: "HAS_NONE",
  EXISTS: "EXISTS",
  NOT_EXISTS: "NOT_EXISTS",
  // Null/Boolean
  IS_NULL: "IS_NULL",
  IS_NOT_NULL: "IS_NOT_NULL",
  IS_TRUE: "IS_TRUE",
  IS_FALSE: "IS_FALSE",
  // Date
  BEFORE: "BEFORE",
  AFTER: "AFTER",
  ON_DATE: "ON_DATE",
  WITHIN_LAST: "WITHIN_LAST",
  WITHIN_NEXT: "WITHIN_NEXT",
  NOT_WITHIN_LAST: "NOT_WITHIN_LAST",
  NOT_WITHIN_NEXT: "NOT_WITHIN_NEXT",
} as const;
export type ConditionOperator =
  (typeof ConditionOperator)[keyof typeof ConditionOperator];

// 5. Logical operator - condition grupları için
export const LogicalOperator = {
  AND: "AND",
  OR: "OR",
} as const;
export type LogicalOperator =
  (typeof LogicalOperator)[keyof typeof LogicalOperator];

export const COMPARISON_OPS = [
  ConditionOperator.EQ,
  ConditionOperator.NEQ,
  ConditionOperator.GT,
  ConditionOperator.GTE,
  ConditionOperator.LT,
  ConditionOperator.LTE,
] as const;
export type ComparisonOps = (typeof COMPARISON_OPS)[number];

export const ARRAY_OPS = [
  ConditionOperator.IN,
  ConditionOperator.NOT_IN,
] as const;
export type ArrayOps = (typeof ARRAY_OPS)[number];

export const DATE_OPS = [
  ConditionOperator.BEFORE,
  ConditionOperator.AFTER,
  ConditionOperator.ON_DATE,
  ConditionOperator.WITHIN_LAST,
  ConditionOperator.NOT_WITHIN_LAST,
] as const;
export type DateOps = (typeof DATE_OPS)[number];

export const RELATION_OPS = [
  ConditionOperator.HAS_ANY,
  ConditionOperator.HAS_ALL,
  ConditionOperator.HAS_NONE,
  ConditionOperator.EXISTS,
  ConditionOperator.NOT_EXISTS,
] as const;
export type RelationOps = (typeof RELATION_OPS)[number];

export const NULL_OPS = [
  ConditionOperator.IS_NULL,
  ConditionOperator.IS_NOT_NULL,
] as const;
export type NullOps = (typeof NULL_OPS)[number];

export const BOOLEAN_OPS = [
  ConditionOperator.IS_TRUE,
  ConditionOperator.IS_FALSE,
] as const;
export type BooleanOps = (typeof BOOLEAN_OPS)[number];

export const STRING_OPS = [
  ConditionOperator.CONTAINS,
  ConditionOperator.NOT_CONTAINS,
  ConditionOperator.STARTS_WITH,
  ConditionOperator.ENDS_WITH,
  ConditionOperator.IS_EMPTY,
  ConditionOperator.IS_NOT_EMPTY,
] as const;
export type StringOps = (typeof STRING_OPS)[number];
export const RANGE_OPS = [ConditionOperator.BETWEEN] as const;
export type RangeOps = (typeof RANGE_OPS)[number];

export const CustomerGroupSmartFields = {
  // Numeric
  ORDER_COUNT: "ORDER_COUNT",
  TOTAL_SPENT: "TOTAL_SPENT",
  AVERAGE_ORDER_VALUE: "AVERAGE_ORDER_VALUE",

  // Date
  LAST_ORDER_DATE: "LAST_ORDER_DATE",
  FIRST_ORDER_DATE: "FIRST_ORDER_DATE",
  CREATED_AT: "CREATED_AT",
  EMAIL_VERIFIED_AT: "EMAIL_VERIFIED_AT",
  PHONE_VERIFIED_AT: "PHONE_VERIFIED_AT",

  // Boolean
  IS_EMAIL_VERIFIED: "IS_EMAIL_VERIFIED",
  IS_PHONE_VERIFIED: "IS_PHONE_VERIFIED",
  HAS_ORDERS: "HAS_ORDERS",
  HAS_ADDRESS: "HAS_ADDRESS",

  // Enum
  ACCOUNT_STATUS: "ACCOUNT_STATUS",
  REGISTRATION_SOURCE: "REGISTRATION_SOURCE",
  SUBSCRIPTION_STATUS: "SUBSCRIPTION_STATUS",

  // Relation
  CUSTOMER_TAGS: "CUSTOMER_TAGS",
  CUSTOMER_GROUPS: "CUSTOMER_GROUPS",
  PRICE_LIST: "PRICE_LIST",

  // Location (Address üzerinden)
  COUNTRY: "COUNTRY",
  STATE: "STATE",
  CITY: "CITY",
  DISTRICT: "DISTRICT",
} as const;

export type CustomerGroupSmartFields =
  (typeof CustomerGroupSmartFields)[keyof typeof CustomerGroupSmartFields];

export const TimeUnit = {
  MINUTES: "MINUTES",
  HOURS: "HOURS",
  DAYS: "DAYS",
  WEEKS: "WEEKS",
  MONTHS: "MONTHS",
  YEARS: "YEARS",
} as const;
export type TimeUnit = (typeof TimeUnit)[keyof typeof TimeUnit];
export const FulfillmentStrategyType = {
  PROXIMITY: "PROXIMITY",
  STOCK_PRIORITY: "STOCK_PRIORITY",
  COST_OPTIMAL: "COST_OPTIMAL",
  LOAD_BALANCE: "LOAD_BALANCE",
  MANUAL: "MANUAL",
} as const;
export type FulfillmentStrategyType =
  (typeof FulfillmentStrategyType)[keyof typeof FulfillmentStrategyType];
