import { ReactNode } from "react";

export type Params = Promise<{ slug: string }>;
export type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

export interface NavbarButtonType {
  label: string;
  icon: ReactNode | null;
  sub: (Omit<NavbarButtonType, "sub"> & { href: string })[];
}
