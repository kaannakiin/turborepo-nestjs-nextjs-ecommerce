import {
  BaseComponentPreviewProps,
  BaseItemPreviewProps,
  DesignComponentCategory,
  DesignComponentsSchemaInputType,
  DesignComponentType,
} from '@repo/types';
import { FC } from 'react';

export interface ComponentFormProps {
  uniqueId: string;
}

export type ComponentPreviewProps<T = unknown> = BaseComponentPreviewProps<T>;

export interface ItemFormProps {
  uniqueId: string;
  parentUniqueId: string;
}

export type ItemPreviewProps<T = unknown> = BaseItemPreviewProps<T>;

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
