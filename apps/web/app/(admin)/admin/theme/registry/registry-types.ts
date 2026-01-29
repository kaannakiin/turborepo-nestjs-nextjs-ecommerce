import {
  DesignComponentCategory,
  DesignComponentsSchemaInputType,
  DesignComponentType,
} from '@repo/types';
import { FC, RefObject } from 'react';

export interface ComponentFormProps {
  uniqueId: string;
}

export interface ComponentPreviewProps<T = unknown> {
  ref?: RefObject<HTMLDivElement>;
  data: T;
  isSelected?: boolean;
  onSelect?: () => void;
}

export interface ItemFormProps {
  uniqueId: string;
  parentUniqueId: string;
}

export interface ItemPreviewProps<T = unknown> {
  data: T;
  index: number;
  isSelected?: boolean;
  onSelect?: () => void;
}

export interface ItemRegistryConfig<T = unknown> {
  arrayKey: string;
  label: string;
  sortable?: boolean;
  FormComponent: FC<ItemFormProps>;
  PreviewComponent: FC<ItemPreviewProps<T>>;
  defaultValue: () => T;
  getItemLabel?: (item: T, index: number) => string;
}

export interface ComponentRegistryEntry<
  T extends DesignComponentsSchemaInputType = DesignComponentsSchemaInputType,
> {
  type: DesignComponentType;
  label: string;
  description?: string;
  category: DesignComponentCategory;
  defaultValue: () => T;
  FormComponent: FC<ComponentFormProps>;
  PreviewComponent: FC<ComponentPreviewProps<T>>;
  itemConfig?: ItemRegistryConfig;
}

export type ComponentRegistry = Partial<
  Record<DesignComponentType, ComponentRegistryEntry>
>;

export type ExtractComponentData<T> =
  T extends ComponentRegistryEntry<infer D> ? D : never;
