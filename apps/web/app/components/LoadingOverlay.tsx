'use client';
import {
  LoadingOverlay as MantineLoadingOverlay,
  LoadingOverlayProps as MantineLoadingOverlayProps,
} from '@mantine/core';
import { usePathname } from 'next/navigation';

type LoadingOverlayProps = Omit<
  MantineLoadingOverlayProps,
  'zIndex' | 'overlayProps' | 'loaderProps'
>;
const LoadingOverlay = ({ ...props }: LoadingOverlayProps) => {
  const pathname = usePathname();

  return (
    <MantineLoadingOverlay
      {...props}
      visible
      zIndex={1000}
      overlayProps={{
        pos: 'fixed',
        radius: 'sm',
        blur: 2,
        style: {
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        },
      }}
      loaderProps={{
        color: pathname.includes('admin') ? 'admin' : 'primary',
        type: 'bars',
      }}
    />
  );
};

export default LoadingOverlay;
