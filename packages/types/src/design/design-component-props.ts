import { Currency, Locale } from "@repo/database/client";
import type { Media } from "../common/enums";
import type { DesignEmailSignupSchemaInputType } from "./components/email-signup.schema";
import type {
  DesignOnboardGridItemBaseSchemaInputType,
  DesignOnboardGridSchemaInputType,
} from "./components/onboard-grid-schema";
import type {
  DesignProductCarouselProductSchemaInputType,
  DesignProductCarouselSchemaInputType,
} from "./components/product-carousel.schema";
import type {
  DesignSliderSchemaInputType,
  DesignSliderSlideSchemaInputType,
} from "./components/slider.schema";

interface RefObject<T> {
  current: T;
}

export interface BaseComponentPreviewProps<T = unknown> {
  ref?: RefObject<HTMLDivElement | null>;
  data: T;
  isSelected?: boolean;
  onSelect?: () => void;
  media?: Media;
  locale?: Locale;
  currency?: Currency;
}

export interface BaseItemPreviewProps<T = unknown> {
  data: T;
  index: number;
  isSelected?: boolean;
  onSelect?: () => void;
  media?: Media;
  locale?: Locale;
  currency?: Currency;
}

export type SliderPreviewProps =
  BaseComponentPreviewProps<DesignSliderSchemaInputType>;
export type SlideItemPreviewProps =
  BaseItemPreviewProps<DesignSliderSlideSchemaInputType>;

export type EmailSignupPreviewProps =
  BaseComponentPreviewProps<DesignEmailSignupSchemaInputType>;

export type OnboardGridPreviewProps =
  BaseComponentPreviewProps<DesignOnboardGridSchemaInputType>;
export type OnboardGridItemPreviewProps =
  BaseItemPreviewProps<DesignOnboardGridItemBaseSchemaInputType>;

export type ProductCarouselPreviewProps =
  BaseComponentPreviewProps<DesignProductCarouselSchemaInputType>;
export type ProductCarouselItemPreviewProps =
  BaseItemPreviewProps<DesignProductCarouselProductSchemaInputType>;
