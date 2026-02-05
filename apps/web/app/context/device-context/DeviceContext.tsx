'use client';

import { useMediaQuery } from '@mantine/hooks';
import { Media } from '@repo/types';
import { usePathname } from 'next/navigation';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  browserName,
  browserVersion,
  deviceType,
  engineName,
  engineVersion,
  getUA,
  isAndroid,
  isBrowser,
  isChrome,
  isChromium,
  isConsole,
  isDesktop,
  isEdge,
  isFirefox,
  isIE,
  isIOS,
  isIOS13,
  isIPad13,
  isIPhone13,
  isIPod13,
  isMacOs,
  isMobile,
  isMobileOnly,
  isMobileSafari,
  isOpera,
  isSafari,
  isSamsungBrowser,
  isSmartTV,
  isTablet,
  isWearable,
  isWindows,
  isWinPhone,
  isYandex,
  mobileModel,
  mobileVendor,
  osName,
  osVersion,
} from 'react-device-detect';

export interface DeviceInfo {
  actualMedia: Media;
  isIOS: boolean;
  isAndroid: boolean;
  isWindows: boolean;
  isMacOS: boolean;
  isWinPhone: boolean;
  osName: string;
  osVersion: string;

  isChrome: boolean;
  isSafari: boolean;
  isFirefox: boolean;
  isEdge: boolean;
  isOpera: boolean;
  isIE: boolean;
  isYandex: boolean;
  isChromium: boolean;
  isSamsungBrowser: boolean;
  browserName: string;
  browserVersion: string;

  engineName: string;
  engineVersion: string;

  isMobile: boolean;
  isMobileOnly: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isBrowser: boolean;
  isSmartTV: boolean;
  isConsole: boolean;
  isWearable: boolean;
  deviceType: string;

  mobileVendor: string;
  mobileModel: string;

  isMobileSafari: boolean;
  isIOS13: boolean;
  isIPad13: boolean;
  isIPhone13: boolean;
  isIPod13: boolean;

  userAgent: string;
}

interface DeviceContextType {
  actualMedia: Media;
  device: DeviceInfo;
  changeActualMedia: (newMedia: Media) => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const DeviceProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const isMobileQuery = useMediaQuery('(max-width: 768px)');
  const isTabletQuery = useMediaQuery('(max-width: 1024px)');

  const [media, setMedia] = useState<Media>('desktop');

  useEffect(() => {
    if (isMobileQuery) {
      setMedia('mobile');
    } else if (isTabletQuery) {
      setMedia('tablet');
    } else {
      setMedia('desktop');
    }
  }, [pathname, isMobileQuery, isTabletQuery]);

  const device = useMemo<DeviceInfo>(
    () => ({
      actualMedia: media,

      isIOS,
      isAndroid,
      isWindows,
      isMacOS: isMacOs,
      isWinPhone,
      osName,
      osVersion,

      isChrome,
      isSafari,
      isFirefox,
      isEdge,
      isOpera,
      isIE,
      isYandex,
      isChromium,
      isSamsungBrowser,
      browserName,
      browserVersion,

      engineName,
      engineVersion,

      isMobile,
      isMobileOnly,
      isTablet,
      isDesktop,
      isBrowser,
      isSmartTV,
      isConsole,
      isWearable,
      deviceType,

      mobileVendor,
      mobileModel,

      isMobileSafari,
      isIOS13,
      isIPad13,
      isIPhone13,
      isIPod13,

      userAgent: getUA,
    }),
    [media],
  );

  const value: DeviceContextType = {
    device,
    actualMedia: media,
    changeActualMedia: setMedia,
  };

  return (
    <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
  );
};

export const useDeviceContext = () => {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default DeviceProvider;
