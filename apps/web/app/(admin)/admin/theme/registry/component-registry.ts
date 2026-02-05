import { createId } from '@repo/shared';
import {
  DesignComponentCategory,
  DesignComponentType,
  DesignEmailSignupSchemaInputType,
  DesignOnboardGridSchemaInputType,
  DesignProductCarouselSchemaInputType,
  DesignSliderSchemaInputType,
} from '@repo/types';
import {
  ModernEmailSignup,
  ModernOnboardGrid,
  ModernProductCarousel,
  ModernSlider,
} from '@repo/ui/designs';
import EmailSignupForm from '../component-forms/email-signup/EmailSignupForm';
import OnboardGridForm from '../component-forms/onboard-grid/OnboardGridForm';
import OnboardGridItemForm from '../component-forms/onboard-grid/OnboardGridItemForm';
import OnboardGridItemPreview from '../component-forms/onboard-grid/OnboardGridItemPreview';
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
    defaultValue: (): DesignProductCarouselSchemaInputType => ({
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
      breakPoints: {
        mobile: 2,
        tablet: 4,
        desktop: 6,
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
      defaultValue:
        (): DesignProductCarouselSchemaInputType['products'][number] => ({
          uniqueId: createId(),
          productVariantCombinationId: '',
          isCustomBadgeActive: false,
          customBadgeText: null,
          customBadgeColor: null,
          productName: '',
          customBadgeTextColor: null,
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
  defaultValue: (): DesignSliderSchemaInputType => ({
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
    defaultValue: (): DesignSliderSchemaInputType['slides'][number] => ({
      uniqueId: createId(),
      image: null as unknown as File,
      existingAsset: null,
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
    defaultValue: (): DesignEmailSignupSchemaInputType => ({
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
      alignment: 'center',
      compact: false,
      minHeight: 300,
      paddingVertical: 48,
      paddingHorizontal: 24,
    }),
    FormComponent: EmailSignupForm,
    PreviewComponent: ModernEmailSignup,
  };

const OnboardGridEntry: ComponentRegistryEntry<DesignOnboardGridSchemaInputType> =
  {
    type: DesignComponentType.ONBOARD_GRID,

    label: 'Onboard Grid',
    description: 'Marka veya kategori tanıtım alanı',
    category: DesignComponentCategory.CONTENT,
    defaultValue: (): DesignOnboardGridSchemaInputType => ({
      uniqueId: createId(),
      type: DesignComponentType.ONBOARD_GRID,
      title: null,
      description: null,
      titleColor: null,
      descriptionColor: null,
      items: [],
      breakPoints: {
        mobile: 1,
        tablet: 2,
        desktop: 3,
      },
    }),
    FormComponent: OnboardGridForm,
    PreviewComponent: ModernOnboardGrid,
    itemConfig: {
      arrayKey: 'items',
      label: 'Öğe',
      sortable: true,
      FormComponent: OnboardGridItemForm,
      PreviewComponent: OnboardGridItemPreview,
      defaultValue: (): DesignOnboardGridSchemaInputType['items'][number] => ({
        uniqueId: createId(),
        customImage: null,
        existingImage: null,
        aspectRatio: 'auto',
        titleColor: null,
        descriptionColor: null,
        slug: null,
        customUrl: null,
        buttonText: null,
        buttonTextColor: null,
        buttonBackgroundColor: null,
        title: null,
        description: null,
        brandId: null,
        categoryId: null,
        linkType: null,
        tagId: null,
      }),
      getItemLabel: (
        item: DesignOnboardGridSchemaInputType['items'][number],
        index: number,
      ) => {
        if (item.title) return item.title;
        return `Öğe ${index + 1}`;
      },
    },
  };

export const componentRegistry: Partial<
  Record<DesignComponentType, ComponentRegistryEntry>
> = {
  PRODUCT_CAROUSEL: ProductCarouselEntry,
  SLIDER: SliderEntry,
  EMAIL_SIGNUP: EmailSignupEntry,
  ONBOARD_GRID: OnboardGridEntry,
  MARQUEE: ProductCarouselEntry,
  CATEGORY_GRID: ProductCarouselEntry,
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
  HERO: 'Hero',
  CONTENT: 'İçerik',
  PRODUCT: 'Ürün',
  NAVIGATION: 'Navigasyon',
  SOCIAL: 'Sosyal',
  UTILITY: 'Yardımcı',
};
