'use client';

import { AppShell, ScrollArea } from '@mantine/core';
import AsideFormRenderer from './AsideFormRenderer';

const AsideSection = () => {
  return (
    <AppShell.Aside>
      <ScrollArea h="100%">
        <AsideFormRenderer />
      </ScrollArea>
    </AppShell.Aside>
  );
};

export default AsideSection;
