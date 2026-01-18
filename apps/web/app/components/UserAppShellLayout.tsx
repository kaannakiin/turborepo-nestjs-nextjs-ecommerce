'use client';
import { useGetCart } from '@hooks/useCart';
import { ActionIcon, AppShell, Drawer, Group, Stack } from '@mantine/core';
import { useDisclosure, useHeadroom } from '@mantine/hooks';
import { TokenPayload } from '@repo/types';
import { IconMenu2, IconUserCircle } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import logo from '../../public/logo.svg';
import CartDrawer from './CartDrawer';
import { LanguageSwitcherProps } from './LanguageSwitcher';

const UserAppShellLayout = ({
  children,
  session,
  localeSwitchConfig,
}: {
  children: React.ReactNode;
  session: TokenPayload | null;
  localeSwitchConfig?: LanguageSwitcherProps;
}) => {
  const pinned = useHeadroom({ fixedAt: 160 });
  const [opened, { open, close }] = useDisclosure();
  const { push } = useRouter();
  useGetCart();

  return (
    <AppShell
      header={{ height: 80, collapsed: !pinned, offset: false }}
      styles={{
        main: {
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
        },
      }}
    >
      <AppShell.Header className="h-20 border-none!">
        <Group
          className="w-full h-20 max-w-[1500px] lg:mx-auto px-4"
          justify="space-between"
          align="center"
        >
          <Group align="center" h={'100%'} gap={'xl'} py={0}>
            <Link href={'/'} className="min-h-full  aspect-2/1 relative">
              <Image src={logo} fill alt="HEADER LOGO" sizes="100vw" />
            </Link>
            <Group
              align="center"
              visibleFrom="sm"
              h={'100%'}
              px={'xl'}
              gap={'xl'}
            ></Group>
          </Group>

          <Group align="center" gap={'0'}>
            <CartDrawer />
            <ActionIcon
              variant="transparent"
              size={'xl'}
              visibleFrom="sm"
              onClick={() => {
                if (session) {
                  push('/dashboard');
                } else {
                  push('/auth');
                }
              }}
            >
              <IconUserCircle size={28} />
            </ActionIcon>
            <ActionIcon
              variant="transparent"
              onClick={open}
              size={'xl'}
              hiddenFrom="sm"
            >
              <IconMenu2 size={28} stroke={2} />
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      <Drawer.Root opened={opened} onClose={close} position="right" size={'xs'}>
        <Drawer.Overlay backgroundOpacity={0.5} blur={4} />
        <Drawer.Content>
          <Drawer.Header py={'0'}>
            <Drawer.Title h={'100%'}>
              <div className="min-h-full h-12 aspect-2/1 relative">
                <Image src={logo} fill alt="HEADER LOGO" sizes="100vw" />
              </div>
            </Drawer.Title>
            <Drawer.CloseButton size={'lg'} fw={700} />
          </Drawer.Header>
          <Drawer.Body className="space-y-2 overflow-y-auto max-h-full"></Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>

      <AppShell.Main pt={'80px'}>
        <Stack style={{ flexGrow: 1 }}>{children}</Stack>
      </AppShell.Main>
    </AppShell>
  );
};

export default UserAppShellLayout;
