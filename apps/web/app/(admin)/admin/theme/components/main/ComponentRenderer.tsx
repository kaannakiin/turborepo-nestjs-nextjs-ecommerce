'use client';

import { useDeviceContext } from '@/context/device-context/DeviceContext';
import { useCurrency } from '@hooks/useCurrency';
import { useLocale } from '@hooks/useLocale';
import {
  Box,
  Stack,
  Text,
  useComputedColorScheme,
  useMantineTheme,
} from '@mantine/core';
import {
  DesignComponentType,
  DesignComponentsSchemaInputType,
} from '@repo/types';
import { Activity, useCallback, useEffect, useRef } from 'react';
import { componentRegistry } from '../../registry';
import { useDesignStore, useIsSelected } from '../../store/design-store';
import { useScrollStore } from '../../store/scroll-store';

interface ComponentRendererProps {
  pageUniqueId: string;
  components: DesignComponentsSchemaInputType[];
}

export default function ComponentRenderer({
  pageUniqueId,
  components,
}: ComponentRendererProps) {
  if (components.length === 0) {
    return (
      <Box
        p="xl"
        style={{
          border: '2px dashed var(--mantine-color-gray-4)',
          borderRadius: 'var(--mantine-radius-md)',
          textAlign: 'center',
        }}
      >
        <Text c="dimmed">Henüz bileşen eklenmedi</Text>
        <Text size="xs" c="dimmed" mt="xs">
          Sol panelden bileşen ekleyin
        </Text>
      </Box>
    );
  }

  return (
    <Stack gap="md">
      {components.map((component) => (
        <PreviewCard
          key={component.uniqueId}
          component={component}
          pageUniqueId={pageUniqueId}
        />
      ))}
    </Stack>
  );
}

interface PreviewCardProps {
  component: DesignComponentsSchemaInputType;
  pageUniqueId: string;
}

function PreviewCard({ component, pageUniqueId }: PreviewCardProps) {
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme('light');
  const cardRef = useRef<HTMLDivElement>(null);
  const { actualMedia } = useDeviceContext();
  const { locale } = useLocale();
  const { currency } = useCurrency();

  const select = useDesignStore((s) => s.select);
  const isSelected = useIsSelected(component.uniqueId);
  const registerRef = useScrollStore((s) => s.registerRef);
  const scrollToComponent = useScrollStore((s) => s.scrollToComponent);

  const entry = componentRegistry[component.type as DesignComponentType];
  const PreviewComponent = entry?.PreviewComponent;

  const handleSelect = useCallback(() => {
    select('component', component.uniqueId, [pageUniqueId, component.uniqueId]);
    scrollToComponent(component.uniqueId);
  }, [select, scrollToComponent, component.uniqueId, pageUniqueId]);

  useEffect(() => {
    if (cardRef.current) {
      registerRef(component.uniqueId, cardRef.current);
    }
    return () => {
      registerRef(component.uniqueId, null);
    };
  }, [registerRef, component.uniqueId]);

  return (
    <div ref={cardRef}>
      <Activity mode={PreviewComponent ? 'visible' : 'hidden'}>
        <Box
          onClick={handleSelect}
          style={{
            cursor: 'pointer',
            border: isSelected
              ? `2px solid ${theme.colors.blue[6]}`
              : '2px solid transparent',
            borderRadius: theme.radius.md,
            transition: 'border-color 0.2s ease',
          }}
        >
          <PreviewComponent
            data={component}
            isSelected={isSelected}
            onSelect={handleSelect}
            media={actualMedia}
            locale={locale || 'TR'}
            currency={currency || 'TRY'}
          />
        </Box>
      </Activity>
      <Activity mode={!PreviewComponent ? 'visible' : 'hidden'}>
        <Box
          p="xl"
          onClick={handleSelect}
          style={{
            cursor: 'pointer',
            backgroundColor:
              colorScheme === 'dark'
                ? theme.colors.dark[6]
                : theme.colors.gray[1],
            borderRadius: theme.radius.md,
            border: isSelected
              ? `2px solid ${theme.colors.blue[6]}`
              : '2px solid transparent',
          }}
        >
          <Text size="sm" c="dimmed" ta="center">
            {entry?.label || component.type} - Önizleme mevcut değil
          </Text>
        </Box>
      </Activity>
    </div>
  );
}
