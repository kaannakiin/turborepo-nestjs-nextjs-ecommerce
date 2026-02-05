'use client';

import {
  Group,
  UnstyledButton,
  useMantineTheme,
  useComputedColorScheme,
} from '@mantine/core';
import { Media } from '@repo/types';
import {
  IconDeviceDesktop,
  IconDeviceIpad,
  IconDeviceMobile,
} from '@tabler/icons-react';
import { useMemo } from 'react';

interface DeviceSwitchButtonsProps {
  actualMedia: Media;
  changeActualMedia: (media: Media) => void;
}

const buttons: Array<{
  value: Media;
  icon: typeof IconDeviceDesktop;
  label: string;
}> = [
  { value: 'desktop', icon: IconDeviceDesktop, label: 'Desktop' },
  { value: 'tablet', icon: IconDeviceIpad, label: 'Tablet' },
  { value: 'mobile', icon: IconDeviceMobile, label: 'Mobile' },
];

const DeviceSwitchButtons = ({
  actualMedia,
  changeActualMedia,
}: DeviceSwitchButtonsProps) => {
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme('light');

  const activeIndex = useMemo(
    () => buttons.findIndex((btn) => btn.value === actualMedia),
    [actualMedia],
  );

  return (
    <Group
      gap={0}
      style={{
        position: 'relative',
        backgroundColor:
          colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],
        borderRadius: theme.radius.md,
        padding: '4px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          width: '40px',
          height: '40px',
          backgroundColor: theme.colors[theme.primaryColor][6],
          borderRadius: theme.radius.sm,
          transform: `translateX(${activeIndex * 40}px)`,
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 0,
        }}
      />

      {buttons.map((button) => {
        const Icon = button.icon;
        const isActive = actualMedia === button.value;

        return (
          <UnstyledButton
            key={button.value}
            onClick={() => changeActualMedia(button.value)}
            style={{
              position: 'relative',
              zIndex: 1,
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: theme.radius.sm,
              transition: 'color 0.2s ease',
              color: isActive
                ? theme.white
                : colorScheme === 'dark'
                  ? theme.colors.dark[1]
                  : theme.colors.gray[7],
            }}
            aria-label={button.label}
          >
            <Icon size={24} stroke={1.5} />
          </UnstyledButton>
        );
      })}
    </Group>
  );
};

export default DeviceSwitchButtons;
