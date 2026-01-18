'use client';
import {
  Box,
  Drawer,
  DrawerProps,
  NavLink,
  ScrollArea,
  Text,
} from '@mantine/core';
import { IconBrandCloudflare } from '@tabler/icons-react';
import React, { useMemo, useState } from 'react';
import StoreSettingsForm from '../settings/components/store-forms/StoreSettingsForm';

type MenuId = (typeof menuItems)[number]['id'];
interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  component?: React.ReactNode;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'domain',
    label: 'Domain Bilgiler',
    icon: <IconBrandCloudflare size={18} />,
    component: <StoreSettingsForm />,
  },
];
const StoreDrawer = (props: DrawerProps) => {
  const [activeId, setActiveId] = useState<MenuId>('domain');

  const renderNavLinks = (items: MenuItem[]) => {
    return items.map((item) => {
      const hasChildren = item.children && item.children.length > 0;

      return (
        <NavLink
          key={item.id}
          label={item.label}
          leftSection={item.icon}
          active={item.id === activeId}
          defaultOpened={true}
          onClick={() => {
            if (!hasChildren) {
              setActiveId(item.id);
            }
          }}
          variant="light"
          classNames={{
            root: 'rounded-md my-1',
            label: 'font-medium',
          }}
        >
          {hasChildren && renderNavLinks(item.children!)}
        </NavLink>
      );
    });
  };

  const activeComponent = useMemo(() => {
    const findComponent = (items: MenuItem[]): React.ReactNode | null => {
      for (const item of items) {
        if (item.id === activeId) return item.component;
        if (item.children) {
          const found = findComponent(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findComponent(menuItems);
  }, [activeId]);

  return (
    <Drawer
      {...props}
      size="100%"
      padding={0}
      styles={{
        header: {
          padding: '1rem',
          borderBottom: '1px solid var(--mantine-color-gray-3)',
          flex: '0 0 auto',
        },
        body: {
          height: 'calc(100vh - 60px)',
          display: 'flex',
          overflow: 'hidden',
        },
        content: {
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box
        w={280}
        style={{
          borderRight: '1px solid var(--mantine-color-gray-3)',
          backgroundColor: 'var(--mantine-color-gray-0)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ScrollArea className="flex-1" p="md">
          {renderNavLinks(menuItems)}
        </ScrollArea>
      </Box>

      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ScrollArea className="flex-1" p="xl">
          {activeComponent || (
            <Text c="dimmed">Görüntülenecek içerik bulunamadı.</Text>
          )}
        </ScrollArea>
      </Box>
    </Drawer>
  );
};

export default StoreDrawer;
