"use client";

import { getQueryClient } from "@lib/serverQueryClient";
import {
  Combobox,
  createTheme,
  MantineColorsTuple,
  MantineProvider,
  Modal,
  MultiSelect,
  SegmentedControl,
  Select,
} from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@repo/shared";
import { IconChevronDown } from "@tabler/icons-react";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import segmentedClasses from "./styles/SegmentedControl.module.css";

const primaryColor: MantineColorsTuple = [
  "#ecf4ff",
  "#dce4f5",
  "#b9c7e2",
  "#94a8d0",
  "#748dc0",
  "#5f7cb7",
  "#5474b4",
  "#44639f",
  "#3a5890",
  "#2c4b80",
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
  const queryClient = getQueryClient();
  const pathname = usePathname();
  const theme = createTheme({
    colors: { primary: primaryColor, admin: adminPrimaryColor },
    cursorType: "pointer",
    primaryColor: pathname.startsWith("/admin") ? "admin" : "primary",
    components: {
      Modal: Modal.extend({
        classNames: {
          title: "text-lg font-semibold",
        },
        defaultProps: {
          centered: true,
          transitionProps: { transition: "scale", duration: 300 },
        },
      }),
      Combobox: Combobox.extend({
        defaultProps: {
          transitionProps: { transition: "pop-bottom-right", duration: 200 },
        },
      }),
      Select: Select.extend({
        defaultProps: {
          rightSection: <IconChevronDown />,
        },
      }),
      MultiSelect: MultiSelect.extend({
        defaultProps: {
          rightSection: <IconChevronDown />,
        },
      }),
      SegmentedControl: SegmentedControl.extend({
        classNames: segmentedClasses,
      }),
    },
  });
  dayjs.extend(customParseFormat);
  return (
    <MantineProvider
      defaultColorScheme="light"
      forceColorScheme="light"
      theme={theme}
    >
      <Notifications position="bottom-right" />
      <QueryClientProvider client={queryClient}>
        <DatesProvider
          settings={{ locale: "tr", firstDayOfWeek: 1, weekendDays: [5, 6] }}
        >
          {children}
        </DatesProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
};

export default LayoutProviderWrapper;
