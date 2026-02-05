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
  system:
    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mantineDefault:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",

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

  timesNewRoman: "'Times New Roman', Times, serif",
  georgia: "Georgia, 'Times New Roman', Times, serif",
  playfairDisplay: "'Playfair Display', Georgia, 'Times New Roman', serif",
  merriweather: "'Merriweather', Georgia, 'Times New Roman', serif",
  crimsonText: "'Crimson Text', Georgia, 'Times New Roman', serif",

  jetBrainsMono: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  firaCode: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
  sourceCodePro: "'Source Code Pro', Consolas, 'Courier New', monospace",
  courierNew: "'Courier New', Courier, monospace",

  dancingScript: "'Dancing Script', cursive",
  greatVibes: "'Great Vibes', cursive",

  sansSerif: "sans-serif",
  serif: "serif",
  monospace: "monospace",
  cursive: "cursive",
} as const;

export type FontFamily = (typeof FontFamily)[keyof typeof FontFamily];

export const AspectRatio = {
  AUTO: "auto",
  SQUARE: "1/1",
  FOUR_BY_THREE: "4/3",
  SIXTEEN_BY_NINE: "16/9",
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

  Playfair_Display: "Playfair Display",
  Merriweather: "Merriweather",
  Lora: "Lora",
  Crimson_Text: "Crimson Text",
  Libre_Baskerville: "Libre Baskerville",
  Source_Serif_4: "Source Serif 4",
  Cormorant: "Cormorant",

  Roboto_Mono: "Roboto Mono",
  Fira_Code: "Fira Code",
  JetBrains_Mono: "JetBrains Mono",
  Source_Code_Pro: "Source Code Pro",
  IBM_Plex_Mono: "IBM Plex Mono",
  Geist_Mono: "Geist Mono",

  Oswald: "Oswald",
  Bebas_Neue: "Bebas Neue",
  Anton: "Anton",
  Archivo_Black: "Archivo Black",

  Ubuntu: "Ubuntu",
  Rubik: "Rubik",
  Quicksand: "Quicksand",
  Comfortaa: "Comfortaa",
} as const;

export type FontType = (typeof FontType)[keyof typeof FontType];

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

export const FullfillmentActionType = {
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
export type FullfillmentActionType =
  (typeof FullfillmentActionType)[keyof typeof FullfillmentActionType];

export const FullfillmentConditionField = {
  CUSTOMER_GROUP: "CUSTOMER_GROUP",

  ORDER_TOTAL: "ORDER_TOTAL",
  ORDER_ITEM_COUNT: "ORDER_ITEM_COUNT",
  ORDER_WEIGHT: "ORDER_WEIGHT",
  ORDER_CURRENCY: "ORDER_CURRENCY",

  PRODUCT_TAG: "PRODUCT_TAG",
  PRODUCT_CATEGORY: "PRODUCT_CATEGORY",
  PRODUCT_BRAND: "PRODUCT_BRAND",

  SHIPPING_METHOD: "SHIPPING_METHOD",
  DESTINATION_COUNTRY: "DESTINATION_COUNTRY",
  DESTINATION_STATE: "DESTINATION_STATE",
  DESTINATION_CITY: "DESTINATION_CITY",

  STOCK_LEVEL: "STOCK_LEVEL",
  LOCATION_TYPE: "LOCATION_TYPE",
  SUPPLIER_LEAD_TIME: "SUPPLIER_LEAD_TIME",

  DAY_OF_WEEK: "DAY_OF_WEEK",
  TIME_OF_DAY: "TIME_OF_DAY",
  IS_HOLIDAY: "IS_HOLIDAY",
} as const;
export type FullfillmentConditionField =
  (typeof FullfillmentConditionField)[keyof typeof FullfillmentConditionField];

export const ConditionOperator = {
  EQ: "EQ",
  NEQ: "NEQ",
  GT: "GT",
  GTE: "GTE",
  LT: "LT",
  LTE: "LTE",

  IN: "IN",
  NOT_IN: "NOT_IN",

  BETWEEN: "BETWEEN",

  CONTAINS: "CONTAINS",
  NOT_CONTAINS: "NOT_CONTAINS",
  STARTS_WITH: "STARTS_WITH",
  ENDS_WITH: "ENDS_WITH",
  IS_EMPTY: "IS_EMPTY",
  IS_NOT_EMPTY: "IS_NOT_EMPTY",

  HAS_ANY: "HAS_ANY",
  HAS_ALL: "HAS_ALL",
  HAS_NONE: "HAS_NONE",
  EXISTS: "EXISTS",
  NOT_EXISTS: "NOT_EXISTS",

  IS_NULL: "IS_NULL",
  IS_NOT_NULL: "IS_NOT_NULL",
  IS_TRUE: "IS_TRUE",
  IS_FALSE: "IS_FALSE",

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
  ORDER_COUNT: "ORDER_COUNT",
  TOTAL_SPENT: "TOTAL_SPENT",
  AVERAGE_ORDER_VALUE: "AVERAGE_ORDER_VALUE",

  LAST_ORDER_DATE: "LAST_ORDER_DATE",
  FIRST_ORDER_DATE: "FIRST_ORDER_DATE",
  CREATED_AT: "CREATED_AT",
  EMAIL_VERIFIED_AT: "EMAIL_VERIFIED_AT",
  PHONE_VERIFIED_AT: "PHONE_VERIFIED_AT",

  IS_EMAIL_VERIFIED: "IS_EMAIL_VERIFIED",
  IS_PHONE_VERIFIED: "IS_PHONE_VERIFIED",
  HAS_ORDERS: "HAS_ORDERS",
  HAS_ADDRESS: "HAS_ADDRESS",

  ACCOUNT_STATUS: "ACCOUNT_STATUS",
  REGISTRATION_SOURCE: "REGISTRATION_SOURCE",
  SUBSCRIPTION_STATUS: "SUBSCRIPTION_STATUS",

  CUSTOMER_TAGS: "CUSTOMER_TAGS",
  CUSTOMER_GROUPS: "CUSTOMER_GROUPS",
  PRICE_LIST: "PRICE_LIST",

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
export const FullfillmentStrategyType = {
  PROXIMITY: "PROXIMITY",
  STOCK_PRIORITY: "STOCK_PRIORITY",
  COST_OPTIMAL: "COST_OPTIMAL",
  LOAD_BALANCE: "LOAD_BALANCE",
  MANUAL: "MANUAL",
} as const;
export type FullfillmentStrategyType =
  (typeof FullfillmentStrategyType)[keyof typeof FullfillmentStrategyType];

export const EdgeType = {
  DEFAULT: "default",
  YES: "yes",
  NO: "no",
} as const;
export type EdgeType = (typeof EdgeType)[keyof typeof EdgeType];

export const ProductPageSortOption = {
  NEWEST: "newest",
  OLDEST: "oldest",
  PRICE_DESC: "price-desc",
  PRICE_ASC: "price-asc",
  BEST_SELLING: "best-selling",
  A_Z: "a-z",
  Z_A: "z-a",
} as const;

export type ProductPageSortOption =
  (typeof ProductPageSortOption)[keyof typeof ProductPageSortOption];

export const SORT_OPTIONS_ARRAY: ProductPageSortOption[] = [
  ProductPageSortOption.NEWEST,
  ProductPageSortOption.OLDEST,
  ProductPageSortOption.PRICE_DESC,
  ProductPageSortOption.PRICE_ASC,
  ProductPageSortOption.BEST_SELLING,
  ProductPageSortOption.A_Z,
  ProductPageSortOption.Z_A,
];

export const PaymentRuleConditionField = {
  CART_TOTAL: "CART_TOTAL",
  CART_ITEM_COUNT: "CART_ITEM_COUNT",

  IS_FIRST_ORDER: "IS_FIRST_ORDER",

  SHIPPING_COUNTRY: "SHIPPING_COUNTRY",
  SHIPPING_STATE: "SHIPPING_STATE",
  SHIPPING_CITY: "SHIPPING_CITY",
  SHIPPING_DISTRICT: "SHIPPING_DISTRICT",
  CUSTOMER_TYPE: "CUSTOMER_TYPE",
  CUSTOMER_GROUP: "CUSTOMER_GROUP",
  CUSTOMER_GROUP_SMART: "CUSTOMER_GROUP_SMART",
} as const;

export type PaymentRuleConditionField =
  (typeof PaymentRuleConditionField)[keyof typeof PaymentRuleConditionField];

export const DesignPageType = {
  HOME: "HOME",
  CATEGORY: "CATEGORY",
  PRODUCT: "PRODUCT",
  BRAND: "BRAND",
  OTHER: "OTHER",
} as const;
export type DesignPageType =
  (typeof DesignPageType)[keyof typeof DesignPageType];

export const DesignComponentType = {
  SLIDER: "SLIDER",
  MARQUEE: "MARQUEE",
  PRODUCT_CAROUSEL: "PRODUCT_CAROUSEL",
  CATEGORY_GRID: "CATEGORY_GRID",
  EMAIL_SIGNUP: "EMAIL_SIGNUP",
  ONBOARD_GRID: "ONBOARD_GRID",
} as const;
export type DesignComponentType =
  (typeof DesignComponentType)[keyof typeof DesignComponentType];

export const DesignComponentCategory = {
  HERO: "HERO",
  CONTENT: "CONTENT",
  PRODUCT: "PRODUCT",
  NAVIGATION: "NAVIGATION",
  SOCIAL: "SOCIAL",
  UTILITY: "UTILITY",
} as const;
export type DesignComponentCategory =
  (typeof DesignComponentCategory)[keyof typeof DesignComponentCategory];

export const DesignName = {
  ELEGANT: "ELEGANT",
  MINIMAL: "MINIMAL",
  MODERN: "MODERN",
  CLASSIC: "CLASSIC",
  VIBRANT: "VIBRANT",
} as const;
export type DesignName = (typeof DesignName)[keyof typeof DesignName];

export const HeaderLinkType = {
  CATEGORY: "CATEGORY",
  BRAND: "BRAND",
  PRODUCT: "PRODUCT",
  SUBMENU: "SUBMENU",
  CUSTOM_URL: "CUSTOM_URL",
};
export type HeaderLinkType =
  (typeof HeaderLinkType)[keyof typeof HeaderLinkType];

export const Media = {
  MOBILE: "mobile",
  TABLET: "tablet",
  DESKTOP: "desktop",
} as const;
export type Media = (typeof Media)[keyof typeof Media];

export const OnboardGridItemLinkType = {
  BRAND: "BRAND",
  CATEGORY: "CATEGORY",
  TAG: "TAG",
} as const;
export type OnboardGridItemLinkType =
  (typeof OnboardGridItemLinkType)[keyof typeof OnboardGridItemLinkType];
