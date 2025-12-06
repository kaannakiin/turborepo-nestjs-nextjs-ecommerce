import { createId } from "@repo/shared";
import {
  SliderComponentInputType,
  MarqueeComponentInputType,
  ProductCarouselComponentInputType,
  SliderInputType,
  ThemeInputType,
} from "./themev2.schema";
import { ThemeComponents } from "../../shared/shared-enum";

export const minimalValidSlide: Omit<SliderInputType, "order" | "sliderId"> = {
  conditionDates: {
    addEndDate: false,
    addStartDate: false,
    endDate: null,
    startDate: null,
  },
  desktopView: {
    file: null,
    existingAsset: {
      url: "https://placehold.co/1920x1080/6E44FF/FFFFFF?text=YENI+SLAYT",
      type: "IMAGE",
    },
  },
  mobileView: null,
};

export const getDefaultSlider = (order: number): SliderComponentInputType => ({
  componentId: createId(),
  type: "SLIDER",
  order,
  options: {
    aspectRatio: "16/9",
    mobileAspectRatio: null,
    autoPlay: true,
    autoPlayInterval: 5000,
    loop: true,
    showIndicators: true,
    showArrows: true,
  },
  sliders: [
    {
      order: 0,
      sliderId: createId(),
      ...minimalValidSlide,
      desktopView: {
        file: null,
        existingAsset: {
          url: "https://placehold.co/1920x1080/6E44FF/FFFFFF?text=YENI+SLAYT+(16:9)",
          type: "IMAGE",
        },
      },
      mobileView: null,
    },
  ],
});

export const getDefaultMarquee = (
  order: number
): MarqueeComponentInputType => ({
  componentId: createId(),
  type: "MARQUEE",
  order,
  items: [
    {
      itemId: createId(),
      text: "Yeni Duyuru Metni",
      link: null,
      image: null,
      existingImage: null,
    },
    {
      itemId: createId(),
      text: "İkinci Duyuru Metni",
      link: null,
      image: null,
      existingImage: null,
    },
  ],
  options: {
    speed: 60,
    pauseOnHover: true,
    isReverse: false,
    backgroundColor: "#F8F9FA",
    textColor: "#343A40",
    fontSize: "md",
    paddingY: "sm",
    fontWeight: "normal",
  },
});

export const getDefaultProductCarousel = (
  order: number
): ProductCarouselComponentInputType => ({
  componentId: createId(),
  type: "PRODUCT_CAROUSEL",
  order,
  title: "Öne Çıkan Ürünler",
  description: "Sezonun en popüler ürünlerini keşfedin.",
  config: {
    slidesPerViewDesktop: 4,
    slidesPerViewTablet: 2,
    slidesPerViewMobile: 1,
    autoplay: false,
    autoplaySpeed: 3000,
    loop: true,
    showArrows: true,
    showDots: true,
    showAddToCartButton: true,
    aspectRatio: "3/4", // Veya Enum'ındaki uygun bir değer (örn: portrait)
  },
  items: [
    {
      // Validasyondan geçmesi için createId ile geçici bir ID atıyoruz.
      // Frontend'de bu ürün "seçilmemiş" gibi görünecek şekilde handle edilmeli.
      productId: createId(),
      variantId: null,
      customTitle: "Örnek Ürün Başlığı",
      badgeText: "YENİ",
      // customImage opsiyonel olduğu için boş bırakabiliriz
    },
    {
      productId: createId(),
      variantId: null,
      customTitle: "İkinci Ürün",
    },
  ],
});

export const createComponent = (order: number, type: ThemeComponents) => {
  switch (type) {
    case "SLIDER":
      return getDefaultSlider(order);
    case "MARQUEE":
      return getDefaultMarquee(order);
    case "PRODUCT_CAROUSEL":
      return getDefaultProductCarousel(order);

    default:
      const _exhaustiveCheck: never = type;
      throw new Error(`Bilinmeyen component türü: ${_exhaustiveCheck}`);
  }
};
export const ThemeV2DefaultValues: ThemeInputType = {
  components: [
    {
      componentId: createId(),
      type: "SLIDER",
      order: 0,
      options: {
        aspectRatio: "21/9",
        mobileAspectRatio: "9/16",
        autoPlay: true,
        autoPlayInterval: 5000,
        loop: true,
        showIndicators: true,
        showArrows: true,
      },
      sliders: [
        {
          order: 0,
          sliderId: createId(),
          ...minimalValidSlide,
          desktopView: {
            file: null,
            existingAsset: {
              url: "https://placehold.co/1920x823/6E44FF/FFFFFF?text=SLIDER+1+(21:9)",
              type: "IMAGE",
            },
          },
          mobileView: {
            file: null,
            existingAsset: {
              url: "https://placehold.co/720x1280/6E44FF/FFFFFF?text=SLAYT+1+MOBIL+(9:16)",
              type: "IMAGE",
            },
          },
        },
        {
          order: 1,
          sliderId: createId(),
          ...minimalValidSlide,
          desktopView: {
            file: null,
            existingAsset: {
              url: "https://placehold.co/1920x823/FF6B6B/FFFFFF?text=SLIDER+1+(21:9)",
              type: "IMAGE",
            },
          },
          mobileView: {
            file: null,
            existingAsset: {
              url: "https://placehold.co/720x1280/FF6B6B/FFFFFF?text=SLAYT+2+MOBIL+(9:16)",
              type: "IMAGE",
            },
          },
        },
        {
          order: 2,
          sliderId: createId(),
          ...minimalValidSlide,
          desktopView: {
            file: null,
            existingAsset: {
              url: "https://placehold.co/1920x823/4ECDC4/FFFFFF?text=SLIDER+1+(21:9)",
              type: "IMAGE",
            },
          },
          mobileView: null,
        },
      ],
    } as SliderComponentInputType,

    {
      componentId: createId(),
      type: "MARQUEE",
      order: 1,
      items: [
        {
          itemId: createId(),
          text: "✨ FIRSATLARI KAÇIRMA",
          link: "https://example.com/firsatlar",
          image: null,
          existingImage: null,
        },
        {
          itemId: createId(),
          text: "🚀 HIZLI KARGO",
          link: "https://example.com/kargo",
          image: null,
          existingImage: null,
        },
        {
          itemId: createId(),
          text: "💳 GÜVENLİ ÖDEME",
          image: null,
          existingImage: null,
        },
        {
          itemId: createId(),
          text: "🎉 YENİ SEZON GELDİ",
          link: "https://example.com/yeni-sezon",
          image: null,
          existingImage: null,
        },
      ],
      options: {
        speed: 40,
        pauseOnHover: true,
        isReverse: false,
        backgroundColor: "#111111",
        textColor: "#FFFFFF",
        fontSize: "sm",
        fontWeight: "bold",
        paddingY: "xs",
      },
    } as MarqueeComponentInputType,

    {
      componentId: createId(),
      type: "SLIDER",
      order: 2,
      options: {
        aspectRatio: "16/9",
        mobileAspectRatio: null,
        autoPlay: true,
        autoPlayInterval: 5000,
        loop: true,
        showIndicators: true,
        showArrows: true,
      },
      sliders: [
        {
          order: 0,
          sliderId: createId(),
          ...minimalValidSlide,
          desktopView: {
            file: null,
            existingAsset: {
              url: "https://placehold.co/1920x1080/F06595/FFFFFF?text=SLIDER+2+(16:9)",
              type: "IMAGE",
            },
          },
          mobileView: {
            file: null,
            existingAsset: {
              url: "https://placehold.co/720x405/F06595/FFFFFF?text=SLAYT+1+MOBIL+(16:9)",
              type: "IMAGE",
            },
          },
        },
        {
          order: 1,
          sliderId: createId(),
          ...minimalValidSlide,
          desktopView: {
            file: null,
            existingAsset: {
              url: "https://placehold.co/1920x1080/A61E4D/FFFFFF?text=SLIDER+2+(16:9)",
              type: "IMAGE",
            },
          },
          mobileView: null,
        },
      ],
    } as SliderComponentInputType,

    {
      componentId: createId(),
      type: "MARQUEE",
      order: 3,
      items: [
        {
          itemId: createId(),
          text: "%50 İNDİRİM",
          image: null,
          existingImage: null,
        },
        {
          itemId: createId(),
          text: "SON GÜN 30 KASIM",
          image: null,
          existingImage: null,
        },
        {
          itemId: createId(),
          text: "BLACK FRIDAY",
          image: null,
          existingImage: null,
        },
      ],
      options: {
        speed: 60,
        pauseOnHover: false,
        isReverse: true,
        backgroundColor: "#F8F9FA",
        textColor: "#343A40",
        fontSize: "md",
        paddingY: "sm",
        fontWeight: "normal",
      },
    } as MarqueeComponentInputType,

    {
      componentId: createId(),
      type: "SLIDER",
      order: 4,
      options: {
        aspectRatio: "1/1",
        mobileAspectRatio: "4/5",
        autoPlay: false,
        autoPlayInterval: 5000,
        loop: true,
        showIndicators: true,
        showArrows: true,
      },
      sliders: [
        {
          order: 0,
          sliderId: createId(),
          ...minimalValidSlide,
          desktopView: {
            file: null,
            existingAsset: {
              url: "https://placehold.co/1080x1080/12B886/FFFFFF?text=SLIDER+3+(1:1)",
              type: "IMAGE",
            },
          },
          mobileView: {
            file: null,
            existingAsset: {
              url: "https://placehold.co/720x900/12B886/FFFFFF?text=SLAYT+1+MOBIL+(4:5)",
              type: "IMAGE",
            },
          },
        },
      ],
    } as SliderComponentInputType,
  ],
};
