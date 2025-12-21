"use client";

import {
  Spotlight,
  SpotlightActionData,
  SpotlightActionGroupData,
} from "@mantine/spotlight";
import { IconSearch } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { getSpotlightItems, navGroups } from "./data";

const AdminSpotlight = () => {
  const router = useRouter();

  const actions: (SpotlightActionGroupData | SpotlightActionData)[] =
    useMemo(() => {
      const spotlightItems = getSpotlightItems();

      const grouped = navGroups
        .map((group) => {
          const groupItems = spotlightItems.filter(
            (item) => item.group === group.label
          );

          if (groupItems.length === 0) return null;

          return {
            group: group.label,
            actions: groupItems.map((item) => ({
              id: item.href,
              label: item.label,
              leftSection: item.icon,
              onClick: () => router.push(`/admin${item.href}`),
              keywords: [item.label.toLowerCase(), item.group.toLowerCase()],
            })),
          };
        })
        .filter(Boolean) as SpotlightActionGroupData[];

      return grouped;
    }, [router]);

  return (
    <Spotlight
      actions={actions}
      nothingFound="Sonuç bulunamadı..."
      highlightQuery
      maxHeight={350}
      searchProps={{
        leftSection: <IconSearch size={20} stroke={1.5} />,
        placeholder: "Sayfa ara...",
      }}
      shortcut={["mod + K"]}
      scrollable
    />
  );
};

export default AdminSpotlight;
