"use client";

import { Control } from "@repo/shared";
import { ProductCarouselComponentInputType, ThemeInputType } from "@repo/types";

interface LeftSideProductFormProps {
  control: Control<ThemeInputType>;
  index: number;
  field: ProductCarouselComponentInputType;
}
const LeftSideProductForm = ({
  index,
  field,
  control,
}: LeftSideProductFormProps) => {
  return <div>LeftSideProductForm</div>;
};

export default LeftSideProductForm;
