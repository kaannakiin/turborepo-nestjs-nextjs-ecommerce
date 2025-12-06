"use client";

import { Control } from "@repo/shared";
import { ThemeInputType } from "@repo/types";

interface ProductCarouselForm {
  control: Control<ThemeInputType>;
  index: number;
}

const ProductCarouselForm = ({ control, index }: ProductCarouselForm) => {
  return <div>ProductCarouselForm</div>;
};

export default ProductCarouselForm;
