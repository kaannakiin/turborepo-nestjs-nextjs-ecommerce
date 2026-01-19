import { z } from 'zod';

// Component variant configuration
export const ComponentVariantConfigSchema = z.object({
  button: z.string().default('rounded'),
  card: z.string().default('elevated'),
  header: z.string().default('classic'),
  footer: z.string().default('standard'),
});

// Template layout configuration
export const TemplateLayoutConfigSchema = z.object({
  auth: z.string().default('split-left'),
  home: z.string().default('hero-slider'),
  product: z.string().default('gallery-left'),
  category: z.string().default('grid'),
});

// Full design configuration schema
export const DesignConfigSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  isActive: z.boolean().default(false),
  components: ComponentVariantConfigSchema,
  templates: TemplateLayoutConfigSchema,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Types
export type DesignConfig = z.infer<typeof DesignConfigSchema>;
export type ComponentVariantConfig = z.infer<typeof ComponentVariantConfigSchema>;
export type TemplateLayoutConfig = z.infer<typeof TemplateLayoutConfigSchema>;

// Default design config
export const defaultDesignConfig: Omit<DesignConfig, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Default',
  isActive: true,
  components: {
    button: 'rounded',
    card: 'elevated',
    header: 'classic',
    footer: 'standard',
  },
  templates: {
    auth: 'split-left',
    home: 'hero-slider',
    product: 'gallery-left',
    category: 'grid',
  },
};
