import { createId } from '@repo/shared';
import {
  DesignComponentCategory,
  DesignComponentType,
  DesignEmailSignupSchemaInputType,
  DesignProductCarouselSchemaInputType,
  DesignSliderSchemaInputType,
} from '@repo/types';
import {
  ModernEmailSignup,
  ModernProductCarousel,
  ModernSlider,
} from '@repo/ui/designs';
import EmailSignupForm from '../component-forms/email-signup/EmailSignupForm';
import ProductCarouselForm from '../component-forms/product-carousel/ProductCarouselForm';
import ProductCarouselItemForm from '../component-forms/product-carousel/ProductCarouselItemForm';
import ProductCarouselItemPreview from '../component-forms/product-carousel/ProductCarouselItemPreview';
import SlideItemForm from '../component-forms/slider/SlideItemForm';
import SlideItemPreview from '../component-forms/slider/SlideItemPreview';
import SliderForm from '../component-forms/slider/SliderForm';
import { ComponentRegistryEntry } from './registry-types';

const ProductCarouselEntry: ComponentRegistryEntry<DesignProductCarouselSchemaInputType> =
  {
    type: DesignComponentType.PRODUCT_CAROUSEL,

    label: 'Ürün Slaytı',
    description: 'Ürünleri slayt olarak gösterir',
    category: DesignComponentCategory.PRODUCT,
    defaultValue: () => ({
      uniqueId: createId(),
      type: DesignComponentType.PRODUCT_CAROUSEL,
      title: null,
      subtitle: null,
      titleColor: null,
      subtitleColor: null,
      titleSize: 'lg',
      subtitleSize: 'md',
      backgroundColor: null,
      products: [],
      viewCounts: {
        mobileProductCount: 2,
        tabletProductCount: 4,
        desktopProductCount: 6,
      },
      showPrice: true,
      showAddToCartButton: true,
    }),
    FormComponent: ProductCarouselForm,
    PreviewComponent: ModernProductCarousel,
    itemConfig: {
      arrayKey: 'products',
      label: 'Ürün',
      sortable: true,
      FormComponent: ProductCarouselItemForm,
      PreviewComponent: ProductCarouselItemPreview,
      defaultValue: () => ({
        uniqueId: createId(),
        productVariantCombinationId: '',
        isCustomBadgeActive: false,
        customBadgeText: null,
        customBadgeColor: null,
        order: 0,
      }),
      getItemLabel: (
        item: DesignProductCarouselSchemaInputType['products'][number],
        index: number,
      ) => {
        if (item.productName) return item.productName;
        if (item.isCustomBadgeActive && item.customBadgeText) {
          return `Ürün ${index + 1} - ${item.customBadgeText}`;
        }
        return `Ürün ${index + 1}`;
      },
    },
  };

const SliderEntry: ComponentRegistryEntry<DesignSliderSchemaInputType> = {
  type: DesignComponentType.SLIDER,

  label: 'Slider',
  description: 'Gorsel slider/banner alani',
  category: DesignComponentCategory.HERO,
  defaultValue: () => ({
    uniqueId: createId(),
    type: DesignComponentType.SLIDER,
    autoplay: true,
    autoplayInterval: 5000,
    showArrows: true,
    showDots: true,
    slides: [],
  }),
  FormComponent: SliderForm,
  PreviewComponent: ModernSlider,
  itemConfig: {
    arrayKey: 'slides',
    label: 'Slayt',

    sortable: true,
    FormComponent: SlideItemForm,
    PreviewComponent: SlideItemPreview,
    defaultValue: () => ({
      uniqueId: createId(),
      image: null as unknown as File,
      title: null,
      subtitle: null,
      buttonText: null,
      buttonLink: null,
      titleColor: null,
      subtitleColor: null,
      buttonColor: null,
      buttonTextColor: null,
      order: 0,
    }),
    getItemLabel: (
      item: DesignSliderSchemaInputType['slides'][number],
      index: number,
    ) => {
      if (item.title) return item.title;
      return `Slayt ${index + 1}`;
    },
  },
};

const EmailSignupEntry: ComponentRegistryEntry<DesignEmailSignupSchemaInputType> =
  {
    type: DesignComponentType.EMAIL_SIGNUP,

    label: 'E-posta Aboneliği',
    description: 'Ziyaretçilerin e-posta listesine abone olmasını sağlar',
    category: DesignComponentCategory.CONTENT,
    defaultValue: () => ({
      uniqueId: createId(),
      type: DesignComponentType.EMAIL_SIGNUP,
      title: 'Bültenimize Abone Olun',
      subtitle: 'En güncel kampanyalardan haberdar olun',
      placeholderText: 'E-posta adresinizi girin',
      buttonText: 'Abone Ol',
      successMessage: 'Başarıyla abone oldunuz!',
      backgroundImage: null,
      backgroundColor: null,
      overlayOpacity: 50,
      titleColor: null,
      titleSize: 'xl',
      subtitleColor: null,
      subtitleSize: 'md',
      buttonColor: null,
      buttonTextColor: null,
      inputBackgroundColor: null,
      inputTextColor: null,
      inputBorderColor: null,
      alignment: 'center',
      compact: false,
      minHeight: 300,
      paddingVertical: 48,
      paddingHorizontal: 24,
    }),
    FormComponent: EmailSignupForm,
    PreviewComponent: ModernEmailSignup,
  };

export const componentRegistry: Partial<
  Record<DesignComponentType, ComponentRegistryEntry>
> = {
  PRODUCT_CAROUSEL: ProductCarouselEntry,
  SLIDER: SliderEntry,
  EMAIL_SIGNUP: EmailSignupEntry,
  MARQUEE: ProductCarouselEntry,
  CATEGORY_GRID: ProductCarouselEntry,
  // ONBOARD_GRID: '',
};

export const getRegistryEntry = (
  type: DesignComponentType,
): ComponentRegistryEntry | undefined => {
  return componentRegistry[type];
};

export const getComponentsByCategory = (): Record<
  DesignComponentCategory,
  ComponentRegistryEntry[]
> => {
  const grouped = {} as Record<
    DesignComponentCategory,
    ComponentRegistryEntry[]
  >;

  Object.values(componentRegistry).forEach((entry) => {
    if (!grouped[entry.category]) {
      grouped[entry.category] = [];
    }

    if (!grouped[entry.category].some((e) => e.type === entry.type)) {
      grouped[entry.category].push(entry);
    }
  });

  return grouped;
};

export const categoryLabels: Record<DesignComponentCategory, string> = {
  [DesignComponentCategory.HERO]: 'Hero',
  [DesignComponentCategory.CONTENT]: 'İçerik',
  [DesignComponentCategory.PRODUCT]: 'Ürün',
  [DesignComponentCategory.NAVIGATION]: 'Navigasyon',
  [DesignComponentCategory.SOCIAL]: 'Sosyal',
  [DesignComponentCategory.UTILITY]: 'Yardımcı',
};
