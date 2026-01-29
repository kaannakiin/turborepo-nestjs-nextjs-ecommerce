'use client';

import { Box, Card, Group, Stack, Text } from '@mantine/core';
import { DesignSliderSchemaInputType } from '@repo/types';
import { IconPhoto, IconSlideshow } from '@tabler/icons-react';
import { DesignPreviewProps } from '../types';

const ModernSlider = ({
  data,
  isSelected,
  onSelect,
}: DesignPreviewProps<DesignSliderSchemaInputType>) => {
  return (
    <Card
      withBorder
      p={0}
      onClick={onSelect}
      style={{
        cursor: 'pointer',
        borderColor: isSelected ? 'var(--mantine-color-blue-6)' : undefined,
        borderWidth: isSelected ? 2 : 1,
        overflow: 'hidden',
      }}
    >
      {/* Slider Preview Area */}
      <Box
        style={{
          height: 200,
          backgroundColor: 'var(--mantine-color-gray-1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {data.slides.length > 0 ? (
          <Stack align="center" gap="xs">
            <IconSlideshow size={48} color="var(--mantine-color-gray-5)" />
            <Text size="sm" c="dimmed">
              {data.slides.length} slayt
            </Text>
          </Stack>
        ) : (
          <Stack align="center" gap="xs">
            <IconPhoto size={48} color="var(--mantine-color-gray-4)" />
            <Text size="sm" c="dimmed">
              Slayt eklenmedi
            </Text>
          </Stack>
        )}

        {/* Navigation Dots Preview */}
        {data.showDots && data.slides.length > 0 && (
          <Group
            gap={4}
            style={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            {data.slides.slice(0, 5).map((_, idx) => (
              <Box
                key={idx}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor:
                    idx === 0
                      ? 'var(--mantine-color-blue-6)'
                      : 'var(--mantine-color-gray-4)',
                }}
              />
            ))}
            {data.slides.length > 5 && (
              <Text size="xs" c="dimmed">
                +{data.slides.length - 5}
              </Text>
            )}
          </Group>
        )}
      </Box>

      {/* Info Bar */}
      <Box p="sm" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
        <Group justify="space-between">
          <Group gap="xs">
            <IconSlideshow size={16} />
            <Text size="sm" fw={500}>
              Slider
            </Text>
          </Group>
          <Group gap="xs">
            {data.autoplay && (
              <Text size="xs" c="dimmed">
                Otomatik
              </Text>
            )}
            <Text size="xs" c="dimmed">
              {data.slides.length} slayt
            </Text>
          </Group>
        </Group>
      </Box>
    </Card>
  );
};

export default ModernSlider;
