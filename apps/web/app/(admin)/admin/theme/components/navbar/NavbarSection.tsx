'use client';

import {
  AppShell,
  Stack,
  Text,
  UnstyledButton,
  useComputedColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { Activity, useMemo, useState } from 'react';
import AddNavbarComponent from './AddNavbarComponent';
import ViewNavbarComponent from './ViewNavbarComponent';

type TabValue = 'add' | 'view';

interface Tab {
  value: TabValue;
  label: string;
}

const tabs: Tab[] = [
  { value: 'add', label: 'Ekle' },
  { value: 'view', label: 'Görüntüle' },
];

const NavbarSection = () => {
  const [activeTab, setActiveTab] = useState<TabValue>('add');
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme('light');

  const activeIndex = useMemo(
    () => tabs.findIndex((tab) => tab.value === activeTab),
    [activeTab],
  );

  return (
    <AppShell.Navbar p="md">
      <Stack gap="md">
        <div
          style={{
            position: 'relative',
            backgroundColor:
              colorScheme === 'dark'
                ? theme.colors.dark[6]
                : theme.colors.gray[1],
            borderRadius: theme.radius.lg,
            padding: '4px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '4px',
              left: '4px',
              right: '4px',
              height: '36px',
              width: `calc((100% - 8px) / ${tabs.length})`,
              backgroundColor: theme.colors[theme.primaryColor][6],
              borderRadius: theme.radius.lg,
              transform: `translateX(${activeIndex * 100}%)`,
              transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 0,
            }}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
              gap: 0,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <UnstyledButton
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  style={{
                    height: '36px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    borderRadius: theme.radius.lg,
                    transition: 'color 0.2s ease',
                    color: isActive
                      ? theme.white
                      : colorScheme === 'dark'
                        ? theme.colors.dark[1]
                        : theme.colors.gray[7],
                  }}
                  aria-label={tab.label}
                >
                  <Text size="xs" fw={isActive ? 600 : 400}>
                    {tab.label}
                  </Text>
                </UnstyledButton>
              );
            })}
          </div>
        </div>

        <Stack gap={'xs'}>
          <Activity mode={activeTab === 'add' ? 'visible' : 'hidden'}>
            <AddNavbarComponent />
          </Activity>
          <Activity mode={activeTab === 'view' ? 'visible' : 'hidden'}>
            <ViewNavbarComponent />
          </Activity>
        </Stack>
      </Stack>
    </AppShell.Navbar>
  );
};

export default NavbarSection;
