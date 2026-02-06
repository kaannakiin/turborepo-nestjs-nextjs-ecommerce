'use client';

import { ActionIcon, Button, Group, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { DesignSchema } from '@repo/types';
import {
  IconDeviceFloppy,
  IconEye,
  IconEyeOff,
  IconX,
} from '@tabler/icons-react';
import { usePreviewStore } from '../../store/preview-store';
import { useDesignStore } from '../../store/design-store';

export default function EditorToolbar() {
  const isDirty = useDesignStore((s) => s.isDirty);
  const design = useDesignStore((s) => s.design);
  const resetToOriginal = useDesignStore((s) => s.resetToOriginal);
  const markClean = useDesignStore((s) => s.markClean);
  const isPreviewMode = usePreviewStore((s) => s.isPreviewMode);
  const togglePreview = usePreviewStore((s) => s.togglePreview);

  const handleSave = () => {
    if (!design) return;

    const result = DesignSchema.safeParse(design);

    if (!result.success) {
      const firstError = result.error.issues[0];
      notifications.show({
        title: 'Doğrulama Hatası',
        message: firstError?.message || 'Tasarımda hatalar var.',
        color: 'red',
      });
      console.error('Validation errors:', result.error.issues);
      return;
    }

    markClean();
    notifications.show({
      title: 'Başarılı',
      message: 'Tasarım kaydedildi.',
      color: 'green',
    });
  };

  const handleCancel = () => {
    resetToOriginal();
    notifications.show({
      title: 'İptal Edildi',
      message: 'Değişiklikler geri alındı.',
      color: 'blue',
    });
  };

  const handlePreview = () => {
    togglePreview();
  };

  return (
    <Group gap="xs">
      <Tooltip label={isPreviewMode ? 'Düzenleme Modu' : 'Önizleme'}>
        <ActionIcon
          variant={isPreviewMode ? 'filled' : 'subtle'}
          size="md"
          onClick={handlePreview}
          color={isPreviewMode ? 'blue' : undefined}
        >
          {isPreviewMode ? <IconEyeOff size={18} /> : <IconEye size={18} />}
        </ActionIcon>
      </Tooltip>

      <Button
        size="xs"
        variant="light"
        color="red"
        leftSection={<IconX size={14} />}
        disabled={!isDirty}
        onClick={handleCancel}
      >
        İptal
      </Button>

      <Button
        size="xs"
        leftSection={<IconDeviceFloppy size={14} />}
        disabled={!isDirty}
        onClick={handleSave}
      >
        Kaydet
      </Button>
    </Group>
  );
}
