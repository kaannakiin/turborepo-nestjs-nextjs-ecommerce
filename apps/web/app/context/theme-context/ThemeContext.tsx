'use client';

import { useMediaQuery } from '@mantine/hooks';
import { usePathname } from 'next/navigation';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import {
  isMobile,
  isTablet,
  isDesktop,
  isBrowser,
  isMobileSafari,
  isIOS,
  isAndroid,
  isChrome,
  isFirefox,
  isSafari,
  isEdge,
  isWindows,
  isMacOs,
  osName,
  osVersion,
  browserName,
  browserVersion,
  deviceType,
  mobileVendor,
  mobileModel,
  isSmartTV,
  isConsole,
  isWearable,
  engineName,
  engineVersion,
  getUA,
  isIOS13,
  isIPad13,
  isIPhone13,
  isIPod13,
  isOpera,
  isIE,
  isYandex,
  isChromium,
  isMobileOnly,
  isWinPhone,
  isSamsungBrowser,
} from 'react-device-detect';

export type Media = 'mobile' | 'tablet' | 'desktop';

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

interface ThemeContextType {
  actualMedia: Media;
  device: DeviceInfo;
  changeActualMedia: (newMedia: Media) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
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

  const value: ThemeContextType = {
    device,
    actualMedia: media,
    changeActualMedia: setMedia,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const useDevice = () => {
  const { device } = useTheme();
  return device;
};

export default ThemeProvider;
