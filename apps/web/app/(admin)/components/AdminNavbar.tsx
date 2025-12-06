"use client";

import { AppShellSection, Group, Highlight, Stack, Text, TextInput, Tooltip, UnstyledButton } from "@mantine/core";
import { useDebouncedState, useHotkeys } from "@mantine/hooks";
import {
  IconBrush,
  IconBuildingWarehouse,
  IconHome2,
  IconPackage,
  IconSearch,
  IconSettings,
  IconShoppingCartBolt,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NavbarButtonType } from "../../../types/GlobalTypes";

const data: Array<NavbarButtonType> = [
  {
    label: "Dashboard",
    icon: <IconHome2 size={24} stroke={2} />,
    sub: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: null,
        hidden: false,
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
        hidden: false,
      },
      {
        href: "/product-list/create-basic/new",
        icon: null,
        label: "Basit Ürün Ekle",
        hidden: true,
      },
      {
        href: "/product-list/create-variant/new",
        icon: null,
        label: "Varyantlı Ürün Ekle",
        hidden: true,
      },
      {
        href: "/product-list/brands",
        icon: null,
        label: "Markalar",
        hidden: false,
      },
      {
        href: "/product-list/brands/new",
        icon: null,
        label: "Marka Ekle",
        hidden: true,
      },
      {
        href: "/product-list/categories",
        icon: null,
        label: "Kategoriler",
        hidden: false,
      },
      {
        href: "/product-list/categories/new",
        icon: null,
        label: "Kategori Ekle",
        hidden: true,
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
        hidden: false,
      },
      {
        href: "/store/discounts",
        icon: null,
        label: "İndirimler",
        hidden: false,
      },
      {
        href: "/store/campaigns",
        icon: null,
        label: "Kampanyalar",
        hidden: false,
      },

      {
        href: "/store/campaigns/new",
        icon: null,
        label: "Kampanya Ekle",
        hidden: true,
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
        hidden: false,
      },
      {
        href: "/carts",
        icon: null,
        label: "Sepetler",
        hidden: false,
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
        hidden: false,
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
        hidden: false,
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
        hidden: false,
      },
      {
        href: "/settings/emails",
        label: "E-Posta Şablonları",
        icon: null,
        hidden: false,
      },
      {
        href: "/settings/payments",
        label: "Ödeme Ayarları",
        icon: null,
        hidden: false,
      },
    ],
  },
];

interface AdminNavbarProps {
  onNavItemClick?: () => void;
}
const AdminNavbar = ({ onNavItemClick }: AdminNavbarProps) => {
  const [activeGroup, setActiveGroup] = useState<number>(0);
  const [activeHref, setActiveHref] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

  const handleCloseSearch = () => {
    if (searchOpen) {
      setSearchOpen(false);
      setInputValue("");
      setDebouncedValue("");
    }
  };

  useHotkeys([
    [
      "mod+K",
      () => {
        setSearchOpen((prev) => !prev);
      },
    ],
    ["esc", handleCloseSearch],
  ]);
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
    const currentPath = pathname.startsWith(adminPrefix) ? pathname.slice(adminPrefix.length) : pathname;

    let bestMatchGroup = 0;
    let bestMatchHref = "";
    let bestMatchLength = 0;

    data.forEach((group, groupIndex) => {
      group.sub.forEach((subItem) => {
        if (currentPath.startsWith(subItem.href) && subItem.href.length > bestMatchLength) {
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
    setSearchOpen(false);
    setInputValue("");
    setDebouncedValue("");
  };

  const handleSubItemClick = (href: string) => {
    push(`/admin${href}`);
    setActiveHref(href);
    onNavItemClick?.();
    setSearchOpen(false);
    setInputValue("");
    setDebouncedValue("");
  };

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
    if (searchOpen) {
      setInputValue("");
      setDebouncedValue("");
    }
  };

  const isSearchMode = searchOpen && debouncedValue.trim().length > 0;

  const itemsToRender = isSearchMode
    ? filteredData
    : (data[activeGroup]?.sub || []).filter((subItem) => !subItem.hidden);

  return (
    <>
      <AppShellSection p="0">
        <div className="relative">
          {!searchOpen ? (
            <UnstyledButton
              onClick={handleSearchToggle}
              className="w-full px-4 py-3 border-b border-gray-200 hover:bg-gray-50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--mantine-color-admin-6)] to-[var(--mantine-color-admin-8)] flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:scale-105">
                  <IconSearch size={18} className="text-white" stroke={2.5} />
                </div>
                <div className="flex-1 text-left">
                  <Text size="sm" fw={500} c="dimmed" className="group-hover:text-gray-700 transition-colors">
                    Menüde Ara
                  </Text>
                  <Text size="xs" c="dimmed" opacity={0.7}>
                    Hızlı erişim için ara
                  </Text>
                </div>
                <Text size="xs" c="dimmed" className="px-2 py-1 bg-gray-100 rounded border border-gray-200 font-mono">
                  Ctrl+K
                </Text>
              </div>
            </UnstyledButton>
          ) : (
            <TextInput
              variant="filled"
              radius={0}
              placeholder="Ara"
              autoFocus
              rightSection={
                <UnstyledButton onClick={handleSearchToggle}>
                  <IconX size={16} className="text-gray-500" />
                </UnstyledButton>
              }
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
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  handleCloseSearch();
                }
              }}
            />
          )}
        </div>
      </AppShellSection>

      <div className="flex h-full">
        <Stack className="w-14 h-full  bg-[var(--mantine-color-admin-0)] border-r border-gray-200">
          <Stack align="center" className="h-full" py={"xs"}>
            {data.map((item, index) => (
              <Tooltip key={index} label={item.label} position="right" offset={10}>
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
        </Stack>
        <div className={`flex-1 bg-white`}>
          {isSearchMode && itemsToRender.length === 0 ? (
            <Text p="md" c="dimmed" size="sm" ta="center">
              Arama sonucu bulunamadı.
            </Text>
          ) : (
            <Stack gap={"sm"} px={"xs"} py={"sm"}>
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
                        activeHref === subItem.href ? "text-white" : "text-gray-500"
                      }`}
                    >
                      {subItem.icon}
                    </div>
                    <Highlight
                      fz={"sm"}
                      fw={600}
                      className={`transition-all duration-200 ${
                        activeHref === subItem.href ? "text-white font-semibold" : "text-gray-700"
                      }`}
                      highlight={isSearchMode ? inputValue : ""}
                      highlightStyles={
                        activeHref === subItem.href
                          ? {
                              backgroundColor: "var(--mantine-primary-color-filled)",
                              color: "white",
                              fontWeight: 700,
                            }
                          : {
                              backgroundColor: "var(--mantine-primary-color-light)",
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
