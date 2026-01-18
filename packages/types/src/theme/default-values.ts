import { createId } from "@paralleldrive/cuid2";
import {
  MarqueeComponentInputType,
  PageInputType,
  ProductCarouselComponentInputType,
  SliderComponentInputType,
  ThemeInputType,
} from "./theme-zod-schemas";
import { ThemeComponents } from "../common";

const PLACEHOLDER_BASE = "https://placehold.co";

const COLORS = {
  primary: "6E44FF",
  secondary: "FF6B6B",
  tertiary: "4ECDC4",
  dark: "111111",
  light: "FFFFFF",
  success: "2ecc71",
  warning: "f1c40f",
};

const getPlaceholderUrl = (
  width: number,
  height: number,
  text: string,
  bgColor = COLORS.primary,
) => {
  const encodedText = encodeURIComponent(text);
  return `${PLACEHOLDER_BASE}/${width}x${height}/${bgColor}/${COLORS.light}.webp?text=${encodedText}`;
};

export const createSlide = (
  sliderId: string = createId(),
): SliderComponentInputType["sliders"][number] => ({
  order: 0,
  sliderId,
  conditionDates: {
    addEndDate: false,
    addStartDate: false,
    endDate: null,
    startDate: null,
  },
  desktopView: {
    file: null,
    existingAsset: {
      url: getPlaceholderUrl(1920, 800, "MASAÜSTÜ GÖRSEL"),
      type: "IMAGE",
    },
  },
  mobileView: {
    file: null,
    existingAsset: {
      url: getPlaceholderUrl(800, 1000, "MOBİL GÖRSEL"),
      type: "IMAGE",
    },
  },
});

export const createSliderComponent = (
  order: number,
): SliderComponentInputType => ({
  componentId: createId(),
  type: "SLIDER",
  order,
  options: {
    aspectRatio: "16/9",
    mobileAspectRatio: "16/9",
    autoPlay: true,
    autoPlayInterval: 5000,
    loop: true,
    showIndicators: true,
    showArrows: true,
  },
  sliders: [
    { ...createSlide(), order: 0 },
    { ...createSlide(), order: 1 },
  ],
});

export const createMarqueeComponent = (
  order: number,
): MarqueeComponentInputType => ({
  componentId: createId(),
  type: "MARQUEE",
  order,
  items: [
    {
      itemId: createId(),
      text: "KARGO BEDAVA",
      link: null,
      image: null,
      existingImage: null,
    },
    {
      itemId: createId(),
      text: "%50 İNDİRİM",
      link: null,
      image: null,
      existingImage: null,
    },
    {
      itemId: createId(),
      text: "YENİ SEZON",
      link: null,
      image: null,
      existingImage: null,
    },
  ],
  options: {
    speed: 50,
    pauseOnHover: true,
    isReverse: false,
    backgroundColor: `#${COLORS.dark}`,
    textColor: `#${COLORS.light}`,
    fontSize: "md",
    paddingY: "sm",
    fontWeight: "bold",
  },
});

export const createProductCarouselComponent = (
  order: number,
): ProductCarouselComponentInputType => ({
  componentId: createId(),
  type: "PRODUCT_CAROUSEL",
  order,
  title: "Çok Satanlar",
  description: "Bu ayın en popüler ürünlerini inceleyin",
  config: {
    slidesPerViewDesktop: 4,
    slidesPerViewTablet: 2,
    slidesPerViewMobile: 1,
    autoplay: false,
    autoplaySpeed: 3000,
    loop: true,
    descriptionTextColor: `#${COLORS.dark}`,
    titleTextColor: `#${COLORS.dark}`,
    showArrows: true,
    showDots: true,
    showAddToCartButton: true,
    aspectRatio: "16/9",
    showTitle: true,
    showDescription: true,
    showDiscountBadge: true,
    badgeBackgroundColor: null,
    badgeTextColor: null,
  },
  items: [
    {
      itemId: createId(),
      productId: "rjkcskxj86rre13me1kj2dpq",
      variantId: null,
      customTitle: "Örnek Ürün 1",
      badgeText: "HOT",
    },
    {
      itemId: createId(),
      productId: "i64a7znsgnv9srlb712tnds3",
      variantId: null,
      customTitle: "Örnek Ürün 2",
    },
  ],
});

export const createComponent = (order: number, type: ThemeComponents) => {
  switch (type) {
    case "SLIDER":
      return createSliderComponent(order);
    case "MARQUEE":
      return createMarqueeComponent(order);
    case "PRODUCT_CAROUSEL":
      return createProductCarouselComponent(order);
    default:
      const _exhaustiveCheck: never = type;
      throw new Error(`Bilinmeyen component türü: ${_exhaustiveCheck}`);
  }
};

export const createDefaultHomePage = (): PageInputType => {
  const heroSlider = createSliderComponent(0);

  const campaignMarquee = createMarqueeComponent(1);

  const bestSellers = createProductCarouselComponent(2);
  bestSellers.title = "Haftanın Yıldızları";
  bestSellers.description = "En çok tercih edilen ürünlerimizi keşfedin.";

  return {
    pageId: createId(),
    pageType: "HOMEPAGE",
    components: [heroSlider, campaignMarquee, bestSellers],
  };
};

export const createDefaultProductPage = (): PageInputType => {
  const trustBadges = createMarqueeComponent(0);
  trustBadges.options.backgroundColor = `#${COLORS.success}`;
  trustBadges.options.speed = 30;
  trustBadges.items = [
    {
      itemId: createId(),
      text: "💯 MÜŞTERİ MEMNUNİYETİ",
      link: null,
      image: null,
      existingImage: null,
    },
    {
      itemId: createId(),
      text: "🚚 AYNI GÜN KARGO",
      link: null,
      image: null,
      existingImage: null,
    },
    {
      itemId: createId(),
      text: "🔒 GÜVENLİ ÖDEME",
      link: null,
      image: null,
      existingImage: null,
    },
    {
      itemId: createId(),
      text: "↩️ 14 GÜN İADE",
      link: null,
      image: null,
      existingImage: null,
    },
  ];

  const similarProducts = createProductCarouselComponent(1);
  similarProducts.title = "Benzer Ürünler";
  similarProducts.description = "Bu ürüne bakanlar bunları da inceledi";
  similarProducts.config.slidesPerViewDesktop = 5;
  similarProducts.config.showAddToCartButton = false;
  similarProducts.config.aspectRatio = "1/1";

  return {
    pageId: createId(),
    pageType: "PRODUCT",
    components: [trustBadges, similarProducts],
  };
};

export const createDefaultTheme = (): ThemeInputType => ({
  id: createId(),
  name: "Modern E-Ticaret Teması",
  header: {
    logo: null,
    announcements: [],
    links: [],
    config: {
      backgroundColor: `#${COLORS.light}`,
      textColor: `#${COLORS.dark}`,
    },
  },
  settings: {
    primaryColor: "#6E44FF",
    secondaryColor: "#FF6B6B",
    primaryShade: 6,
    font: "Anton",
  },
  isActive: false,
  pages: [createDefaultHomePage(), createDefaultProductPage()],
});
