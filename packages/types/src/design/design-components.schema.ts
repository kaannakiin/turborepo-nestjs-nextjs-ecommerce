import { z } from "zod";
import { DesignEmailSignupSchema } from "./components/email-signup.schema";
import { DesignProductCarouselSchema } from "./components/product-carousel.schema";
import { DesignSliderSchema } from "./components/slider.schema";
import { DesignOnboardGridSchema } from "./components/onboard-grid-schema";

export const DesignComponentsSchema = z.discriminatedUnion("type", [
  DesignProductCarouselSchema,
  DesignSliderSchema,
  DesignEmailSignupSchema,
  DesignOnboardGridSchema,
]);

export type DesignComponentsSchemaInputType = z.input<
  typeof DesignComponentsSchema
>;
export type DesignComponentsSchemaOutputType = z.output<
  typeof DesignComponentsSchema
>;
