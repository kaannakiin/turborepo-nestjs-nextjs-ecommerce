"use client";

import {
  AppShellSection,
  Group,
  Highlight,
  Stack,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import {
  IconBrush,
  IconBuildingWarehouse,
  IconHome2,
  IconPackage,
  IconSearch,
  IconSettings,
  IconShoppingCartBolt,
  IconUser,
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NavbarButtonType } from "../../../types/GlobalTypes";

// data[...] (Aynı, değişiklik yok)
const data: NavbarButtonType[] = [
  {
    label: "Dashboard",
    icon: <IconHome2 size={24} stroke={2} />,
    sub: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: null,
      },
    ],
  },
  {
    label: "Ürünler",
    icon: <IconPackage size={24} stroke={2} />,
    sub: [
      {
        href: "/product-list",
        icon: null,
        label: "Ürün Listesi",
      },
      {
        href: "/product-list/brands",
        icon: null,
        label: "Markalar",
      },
      {
        href: "/product-list/categories",
        icon: null,
        label: "Kategoriler",
      },
    ],
  },
  {
    label: "Mağaza",
    icon: <IconBuildingWarehouse size={24} stroke={2} />,
    sub: [
      {
        href: "/store",
        icon: null,
        label: "Mağaza",
      },
      {
        href: "/store/discounts",
        icon: null,
        label: "İndirimler",
      },

      {
        href: "/store/campaigns",
        icon: null,
        label: "Kampanyalar",
      },
    ],
  },
  {
    label: "Sepetler ve Siparişler",
    icon: <IconShoppingCartBolt size={24} stroke={2} />,
    sub: [
      {
        href: "/orders",
        icon: null,
        label: "Siparişler",
      },
      {
        href: "/carts",
        icon: null,
        label: "Sepetler",
      },
    ],
  },
  {
    label: "Kullanıcılar",
    icon: <IconUser size={24} stroke={2} />,
    sub: [
      {
        href: "/users/user-list",
        icon: null,
        label: "Kullanıcı Listesi",
      },
    ],
  },

  {
    label: "Tema",
    icon: <IconBrush size={24} stroke={2} />,
    sub: [
      {
        href: "/theme",
        icon: null,
        label: "Tema Ayarları",
      },
    ],
  },
  {
    label: "Ayarlar",
    icon: <IconSettings />,
    sub: [
      {
        href: "/settings",
        icon: null,
        label: "Ayarlar",
      },
      { href: "/settings/emails", label: "E-Posta Şablonları", icon: null },
      { href: "/settings/payments", label: "Ödeme Ayarları", icon: null },
    ],
  },
];

interface AdminNavbarProps {
  onNavItemClick?: () => void;
}
const AdminNavbar = ({ onNavItemClick }: AdminNavbarProps) => {
  const [activeGroup, setActiveGroup] = useState<number>(0);
  const [activeHref, setActiveHref] = useState<string>("");

  const [debouncedValue, setDebouncedValue] = useDebouncedState("", 200);
  const [inputValue, setInputValue] = useState("");
  const [filteredData, setFilteredData] = useState<NavbarButtonType["sub"]>([]);

  const { push } = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!debouncedValue.trim()) {
      setFilteredData([]);
      return;
    }

    const lowerCaseValue = debouncedValue.toLowerCase().trim();
    const results: NavbarButtonType["sub"] = [];

    data.forEach((group) => {
      group.sub.forEach((subItem) => {
        if (subItem.label.toLowerCase().includes(lowerCaseValue)) {
          results.push(subItem);
        }
      });
    });

    setFilteredData(results);
  }, [debouncedValue]);

  useEffect(() => {
    const adminPrefix = "/admin";
    const currentPath = pathname.startsWith(adminPrefix)
      ? pathname.slice(adminPrefix.length)
      : pathname;

    let bestMatchGroup = 0;
    let bestMatchHref = "";
    let bestMatchLength = 0;

    data.forEach((group, groupIndex) => {
      group.sub.forEach((subItem) => {
        if (
          currentPath.startsWith(subItem.href) &&
          subItem.href.length > bestMatchLength
        ) {
          bestMatchLength = subItem.href.length;
          bestMatchGroup = groupIndex;
          bestMatchHref = subItem.href;
        }
      });
    });

    setActiveGroup(bestMatchGroup);
    setActiveHref(bestMatchHref);
  }, [pathname]);

  const handleGroupClick = (index: number) => {
    setActiveGroup(index);
    setInputValue("");
    setDebouncedValue("");
  };

  const handleSubItemClick = (href: string) => {
    push(`/admin${href}`);
    setActiveHref(href);
    onNavItemClick?.();
    setInputValue("");
    setDebouncedValue("");
  };
  const isSearchMode = debouncedValue.trim().length > 0;
  const itemsToRender = isSearchMode
    ? filteredData
    : data[activeGroup]?.sub || [];

  return (
    <>
      <AppShellSection p="0">
        <TextInput
          variant="filled"
          radius={0}
          placeholder="Ara"
          rightSection={<IconSearch />}
          value={inputValue}
          styles={{
            input: {
              border: "none",
              "&:focus": {
                border: "none",
              },
            },
          }}
          onChange={(event) => {
            const newValue = event.currentTarget.value;
            setInputValue(newValue);
            setDebouncedValue(newValue);
          }}
        />
      </AppShellSection>

      <div className="flex h-full">
        <div className="w-14 bg-[var(--mantine-color-admin-0)] border-r border-gray-200">
          <Stack align="center" gap={"lg"} py={"xs"}>
            {data.map((item, index) => (
              <Tooltip
                key={index}
                label={item.label}
                position="right"
                offset={10}
              >
                <UnstyledButton
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ease-in-out ${
                    activeGroup === index && !isSearchMode
                      ? "bg-[var(--mantine-color-admin-9)] text-white shadow-md hover:bg-[var(--mantine-color-admin-8)] hover:shadow-lg hover:scale-105"
                      : "text-gray-600 hover:bg-[var(--mantine-color-admin-2)] hover:text-[var(--mantine-color-admin-9)] hover:shadow-sm hover:scale-105"
                  }`}
                  onClick={() => handleGroupClick(index)}
                >
                  {item.icon}
                </UnstyledButton>
              </Tooltip>
            ))}
          </Stack>
        </div>

        <div className={`flex-1 bg-white`}>
          {isSearchMode && itemsToRender.length === 0 ? (
            <Text p="md" c="dimmed" size="sm" ta="center">
              Arama sonucu bulunamadı.
            </Text>
          ) : (
            <Stack gap={0} px={"xs"} py={"sm"}>
              {itemsToRender.map((subItem, subIndex) => (
                <UnstyledButton
                  key={subIndex}
                  className={`w-full p-3 rounded-lg transition-all duration-200 ease-in-out ${
                    activeHref === subItem.href
                      ? "bg-[var(--mantine-color-admin-9)] hover:bg-[var(--mantine-color-admin-8)] shadow-sm"
                      : "hover:bg-[var(--mantine-color-admin-1)] hover:shadow-sm hover:translate-x-1"
                  }`}
                  onClick={() => handleSubItemClick(subItem.href)}
                >
                  <Group gap={12} align="center">
                    <div
                      className={`transition-colors duration-200 ${
                        activeHref === subItem.href
                          ? "text-white"
                          : "text-gray-500"
                      }`}
                    >
                      {subItem.icon}
                    </div>
                    <Highlight
                      fz={"sm"}
                      fw={600}
                      className={`transition-all duration-200 ${
                        activeHref === subItem.href
                          ? "text-white font-semibold"
                          : "text-gray-700"
                      }`}
                      highlight={isSearchMode ? inputValue : ""}
                      highlightStyles={
                        activeHref === subItem.href
                          ? {
                              backgroundColor:
                                "var(--mantine-primary-color-filled)",
                              color: "white",
                              fontWeight: 700,
                            }
                          : {
                              backgroundColor:
                                "var(--mantine-primary-color-light)",
                              color: "var(--mantine-primary-color-filled)",
                              fontWeight: 700,
                            }
                      }
                    >
                      {subItem.label}
                    </Highlight>
                  </Group>
                </UnstyledButton>
              ))}
            </Stack>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminNavbar;
