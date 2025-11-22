"use client";
import {
  ActionIcon,
  Box,
  Divider,
  Group,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  Control,
  UseFormReturn,
  UseFormSetValue,
  useWatch,
} from "@repo/shared";
import {
  MarqueeComponentInputType,
  SliderComponentInputType,
  ThemeInputType,
} from "@repo/types";
import {
  IconClick,
  IconClipboard,
  IconInfoCircle,
  IconMarquee,
  IconX,
} from "@tabler/icons-react";
import { useThemeStore } from "../store/zustand-zod-theme.store";
import MarqueeForm from "./right-side-forms/MarqueeForm";
import MarqueeItemForm from "./right-side-forms/MarqueeItemForm";
import SlideForm from "./right-side-forms/SlideForm";
import SliderForm from "./right-side-forms/SliderForm";
import { useEffect } from "react";

interface AsideFormsTableProps {
  forms: UseFormReturn<ThemeInputType>;
}

interface AsideFormLayoutProps {
  icon: React.ComponentType<{ size?: number }>;
  iconColor?: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}

interface EmptyStateProps {
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  description: string;
  color?: string;
  clearAction: () => void;
}

const AsideFormsTable = ({
  forms: { setValue, control },
}: AsideFormsTableProps) => {
  const { selection, clearSelection } = useThemeStore();
  const allComponents = useWatch({ control, name: "components" });

  if (!allComponents) {
    return (
      <EmptyState
        clearAction={clearSelection}
        icon={IconInfoCircle}
        title="Yükleniyor..."
        description="Tema verileri getiriliyor"
      />
    );
  }

  switch (selection?.type) {
    case "SLIDE": {
      const componentIndex = allComponents.findIndex(
        (c) => c.componentId === selection.componentId
      );

      if (componentIndex === -1) {
        return (
          <EmptyState
            clearAction={clearSelection}
            icon={IconInfoCircle}
            title="Öğe Bulunamadı"
            description="Seçilen öğe artık mevcut değil"
            color="red"
          />
        );
      }

      const component = allComponents[componentIndex];

      if (component.type !== "SLIDER") {
        return (
          <EmptyState
            clearAction={clearSelection}
            icon={IconInfoCircle}
            title="Geçersiz Seçim"
            description="Seçilen öğe için form bulunamadı"
            color="red"
          />
        );
      }

      const slideIndex = (
        component as SliderComponentInputType
      ).sliders.findIndex((s) => s.sliderId === selection.id);

      if (slideIndex === -1) {
        return (
          <EmptyState
            clearAction={clearSelection}
            icon={IconInfoCircle}
            title="Öğe Bulunamadı"
            description="Seçilen öğe artık mevcut değil"
            color="red"
          />
        );
      }

      const pathPrefix =
        `components.${componentIndex}.sliders.${slideIndex}` as const;
      const slide = (component as SliderComponentInputType).sliders[slideIndex];

      return (
        <AsideFormLayout
          icon={IconClipboard}
          title="Slayt Ayarları"
          subtitle={`Sıra: ${slide.order + 1}`}
          onClose={clearSelection}
        >
          <SlideForm
            key={pathPrefix}
            componentIndex={componentIndex}
            slideIndex={slideIndex}
            control={control}
            setValue={setValue}
          />
        </AsideFormLayout>
      );
    }

    case "COMPONENT": {
      const component = allComponents.find(
        (c) => c.componentId === selection.componentId
      );
      const index = allComponents.findIndex(
        (c) => c.componentId === selection.componentId
      );

      if (!component || index === -1) {
        return (
          <EmptyState
            clearAction={clearSelection}
            icon={IconInfoCircle}
            title="Öğe Bulunamadı"
            description="Seçilen öğe artık mevcut değil"
            color="red"
          />
        );
      }

      return (
        <AsideFormLayout
          icon={IconClipboard}
          title={`${component.type === "SLIDER" ? "Slider" : "Marquee"} Ayarları`}
          subtitle={`Sıra: ${component.order + 1}`}
          onClose={clearSelection}
        >
          {component.type === "SLIDER" ? (
            <SliderForm
              control={control}
              index={index}
              key={component.componentId}
            />
          ) : component.type === "MARQUEE" ? (
            <MarqueeForm
              control={control}
              index={index}
              key={component.componentId}
            />
          ) : null}
        </AsideFormLayout>
      );
    }

    case "MARQUEE_ITEM": {
      const componentIndex = allComponents.findIndex(
        (c) => c.componentId === selection.componentId
      );

      if (componentIndex === -1) {
        return (
          <EmptyState
            clearAction={clearSelection}
            icon={IconInfoCircle}
            title="Öğe Bulunamadı"
            description="Seçilen öğe artık mevcut değil"
            color="red"
          />
        );
      }

      const component = allComponents[componentIndex];

      if (component.type !== "MARQUEE") {
        return (
          <EmptyState
            clearAction={clearSelection}
            icon={IconInfoCircle}
            title="Geçersiz Seçim"
            description="Seçilen öğe için form bulunamadı"
            color="red"
          />
        );
      }
      const itemIndex = (
        component as MarqueeComponentInputType
      ).items.findIndex((item) => item.itemId === selection.itemId);

      if (itemIndex === -1) {
        return (
          <EmptyState
            clearAction={clearSelection}
            icon={IconInfoCircle}
            title="Öğe Bulunamadı"
            description="Seçilen öğe artık mevcut değil"
            color="red"
          />
        );
      }
      const pathPrefix =
        `components.${componentIndex}.items.${itemIndex}` as const;
      return (
        <AsideFormLayout
          icon={IconMarquee}
          iconColor="orange"
          title="Marquee Item Ayarları"
          subtitle={`${itemIndex + 1}. öğe`}
          onClose={clearSelection}
        >
          <MarqueeItemForm
            key={pathPrefix}
            index={itemIndex}
            control={control}
            componentIndex={componentIndex}
          />
        </AsideFormLayout>
      );
    }

    default: {
      return (
        <EmptyState
          clearAction={clearSelection}
          icon={IconClick}
          title="Bir öğe seçin"
          description="Düzenlemek için bir öğe seçerek başlayın"
        />
      );
    }
  }
};

const AsideFormLayout = ({
  icon: Icon,
  iconColor = "violet",
  title,
  subtitle,
  onClose,
  children,
}: AsideFormLayoutProps) => {
  return (
    <Box>
      <Group justify="space-between" mb="md" wrap="nowrap">
        <Group gap="xs">
          <ThemeIcon size="lg" variant="light" color={iconColor}>
            <Icon size={20} />
          </ThemeIcon>
          <Box>
            <Text fw={600} size="sm">
              {title}
            </Text>
            {subtitle && (
              <Text size="xs" c="dimmed">
                {subtitle}
              </Text>
            )}
          </Box>
        </Group>
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={onClose}
          aria-label="Kapat"
        >
          <IconX size={18} />
        </ActionIcon>
      </Group>

      <Divider mb="md" />

      <Stack gap="md">{children}</Stack>
    </Box>
  );
};

const EmptyState = ({
  icon: Icon,
  title,
  description,
  clearAction,
  color = "blue",
}: EmptyStateProps) => {
  useEffect(() => {
    clearAction();
  }, [clearAction]);
  return (
    <Stack align="center" justify="center" gap="lg" py="xl" px="md" h="100%">
      <ThemeIcon size={64} variant="light" color={color} radius="xl">
        <Icon size={32} />
      </ThemeIcon>

      <Stack align="center" gap="xs">
        <Text fw={600} size="lg" ta="center">
          {title}
        </Text>
        <Text size="sm" c="dimmed" ta="center" maw={280}>
          {description}
        </Text>
      </Stack>
    </Stack>
  );
};

export default AsideFormsTable;
