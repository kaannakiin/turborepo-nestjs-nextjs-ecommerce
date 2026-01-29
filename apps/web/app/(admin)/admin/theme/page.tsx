'use client';

import { useDeviceContext } from '@/context/device-context/DeviceContext';
import { AppShell, Container, Group, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import AsideSection from './components/aside/AsideSection';
import DndProvider from './components/dnd/DndProvider';
import DeviceSwitchButtons from './components/editor/DeviceSwitchButtons';
import EditorToolbar from './components/editor/EditorToolbar';
import PageTabs from './components/editor/PageTabs';
import MainContent from './components/main/MainContent';
import NavbarSection from './components/navbar/NavbarSection';
import ScrollProvider from './context/scroll-context';

export default function ThemePage() {
  const [opened] = useDisclosure();
  const { actualMedia, changeActualMedia } = useDeviceContext();

  return (
    <ScrollProvider>
      <DndProvider>
        <AppShell
          header={{ height: 60 }}
          navbar={{
            width: 300,
            breakpoint: 'sm',
            collapsed: { mobile: !opened },
          }}
          aside={{
            width: 350,
            breakpoint: 'md',
            collapsed: { desktop: false, mobile: true },
          }}
          padding="md"
        >
          <AppShell.Header>
            <Group h="100%" px="md" justify="space-between">
              <Group>
                <Title fz={'h4'}>Dizayn Editör</Title>
                <PageTabs />
              </Group>
              <DeviceSwitchButtons
                changeActualMedia={changeActualMedia}
                actualMedia={actualMedia}
              />
              <Group gap="md">
                <EditorToolbar />
              </Group>
            </Group>
          </AppShell.Header>
          <NavbarSection />
          <AppShell.Main className="flex flex-col mx-auto">
            <Container
              className="w-full transition-all duration-200"
              size={
                actualMedia === 'desktop'
                  ? 'xl'
                  : actualMedia === 'tablet'
                    ? 'md'
                    : 'xs'
              }
            >
              <MainContent />
            </Container>
          </AppShell.Main>
          <AsideSection />
        </AppShell>
      </DndProvider>
    </ScrollProvider>
  );
}
