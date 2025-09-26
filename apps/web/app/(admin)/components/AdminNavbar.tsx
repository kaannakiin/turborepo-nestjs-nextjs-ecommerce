"use client";

import {
  Group,
  Stack,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import {
  IconBrush,
  IconBuildingWarehouse,
  IconHome2,
  IconPackage,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NavbarButtonType } from "../../../types/GlobalTypes";

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
        href: "/product-list/create-variant/new",
        icon: null,
        label: "Varyantlı Ürün Oluştur",
      },
      {
        href: "/product-list/create-basic/new",
        icon: null,
        label: "Basit Ürün Oluştur",
      },
      {
        href: "/product-list/brands",
        icon: null,
        label: "Markalar",
      },
      {
        href: "/product-list/brands/new",
        icon: null,
        label: "Marka Oluştur",
      },
      {
        href: "/product-list/categories",
        icon: null,
        label: "Kategoriler",
      },
      {
        href: "/product-list/categories/new",
        icon: null,
        label: "Kategori Oluştur",
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
        href: "/store/discounts/new",
        icon: null,
        label: "Yeni İndirim",
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
      {
        href: "/users/user-create",
        icon: null,
        label: "Kullanıcı Oluştur",
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
      {
        href: "/theme/slider",
        icon: null,
        label: "Slider",
      },
      { href: "/theme/marquee", icon: null, label: "Marquee (Kayan Yazı)" },
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
    ],
  },
];
interface AdminNavbarProps {
  onNavItemClick?: () => void;
}
const AdminNavbar = ({ onNavItemClick }: AdminNavbarProps) => {
  const [activeGroup, setActiveGroup] = useState<number>(0);
  const [activeHref, setActiveHref] = useState<string>("");

  const { push } = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const adminPrefix = "/admin";
    const currentPath = pathname.startsWith(adminPrefix)
      ? pathname.slice(adminPrefix.length)
      : pathname;

    setActiveHref(currentPath);

    let foundGroup = 0;
    data.forEach((group, groupIndex) => {
      group.sub.forEach((subItem) => {
        if (subItem.href === currentPath) {
          foundGroup = groupIndex;
        } else if (
          currentPath.startsWith(subItem.href) &&
          subItem.href !== "/"
        ) {
          foundGroup = groupIndex;
        } else if (
          currentPath.startsWith("/users") &&
          subItem.href.startsWith("/users")
        ) {
          foundGroup = groupIndex;
        }
      });
    });

    setActiveGroup(foundGroup);
  }, [pathname]);

  const handleGroupClick = (index: number) => {
    setActiveGroup(index);
  };

  const handleSubItemClick = (href: string) => {
    push(`/admin${href}`);
    setActiveHref(href);
    onNavItemClick?.(); // Mobilde navbar'ı kapat
  };

  return (
    <>
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
                    activeGroup === index
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
          {data[activeGroup]?.sub && data[activeGroup].sub.length > 0 ? (
            <Stack gap={0} px={"xs"} py={"sm"}>
              {data[activeGroup].sub?.map((subItem, subIndex) => (
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
                    <Text
                      fz={"sm"}
                      size="sm"
                      fw={700}
                      className={`transition-all duration-200 ${
                        activeHref === subItem.href
                          ? "text-white font-semibold"
                          : "text-gray-700 group-hover:text-[var(--mantine-color-admin-9)]"
                      }`}
                    >
                      {subItem.label}
                    </Text>
                  </Group>
                </UnstyledButton>
              ))}
            </Stack>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default AdminNavbar;
