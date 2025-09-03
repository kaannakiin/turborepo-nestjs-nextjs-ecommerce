"use client";

import {
  createTheme,
  MantineColorsTuple,
  MantineProvider,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@repo/shared";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
const primaryColor: MantineColorsTuple = [
  "#fff0e4",
  "#ffe0cf",
  "#fac0a1",
  "#f69e6e",
  "#f28043",
  "#f06e27",
  "#f06418",
  "#d6530c",
  "#bf4906",
  "#a73c00",
];
const adminPrimaryColor: MantineColorsTuple = [
  "#eff2ff",
  "#dfe2f2",
  "#bdc2de",
  "#99a0ca",
  "#7a84b9",
  "#6672af",
  "#5c69ac",
  "#4c5897",
  "#424e88",
  "#36437a",
];

const LayoutProviderWrapper = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const theme = createTheme({
    colors: { primary: primaryColor, admin: adminPrimaryColor },
    primaryColor: pathname.startsWith("/admin") ? "admin" : "primary",
  });
  return (
    <QueryClientProvider client={new QueryClient()}>
      <MantineProvider
        defaultColorScheme="light"
        forceColorScheme="light"
        theme={theme}
      >
        <Notifications />
        {children}
      </MantineProvider>
    </QueryClientProvider>
  );
};

export default LayoutProviderWrapper;
