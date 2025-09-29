"use client";
import { useMediaQuery } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type Media = "mobile" | "tablet" | "desktop";

interface ThemeContextType {
  media: Media;
  changeMedia: (newMedia: Media) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  const [media, setMedia] = useState<Media>("desktop");

  useEffect(() => {
    if (isMobile) {
      setMedia("mobile");
    } else if (isTablet) {
      setMedia("tablet");
    } else {
      setMedia("desktop");
    }
  }, [pathname, isMobile, isTablet]);

  const changeMedia = (newMedia: Media) => {
    setMedia(newMedia);
  };

  const value = {
    media,
    changeMedia,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeProvider;
