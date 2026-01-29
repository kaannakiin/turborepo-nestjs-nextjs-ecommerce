'use client';

import { Center, Stack, Text } from '@mantine/core';
import { IconPointer } from '@tabler/icons-react';

const AsideEmptyState = () => {
  return (
    <Center h="100%">
      <Stack align="center" gap="sm" pt={'xl'}>
        <IconPointer size={48} stroke={1.5} color="gray" />
        <Text size="sm" c="dimmed" ta="center">
          Duzenlemek icin bir bilesen secin
        </Text>
      </Stack>
    </Center>
  );
};

export default AsideEmptyState;
