import {
  IconBrandAbstract,
  IconBrush,
  IconBuildingStore,
  IconCategory,
  IconCreditCard,
  IconDiscount,
  IconForklift,
  IconLayoutDashboard,
  IconList,
  IconMail,
  IconPackage,
  IconSettings,
  IconShoppingCart,
  IconTag,
  IconTruckDelivery,
  IconUsers,
} from "@tabler/icons-react";
import React from "react";

export interface NavSubItem {
  label: string;
  href: string;
  hidden?: boolean;
  tooltip?: string;
}

export interface NavGroup {
  label: string;
  icon: React.ReactNode;
  sub: NavSubItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Dashboard",
    icon: <IconLayoutDashboard size={20} stroke={1.8} />,
    sub: [{ href: "/dashboard", label: "Dashboard" }],
  },
  {
    label: "Ürünler",
    icon: <IconPackage size={20} stroke={1.8} />,
    sub: [
      { href: "/product-list", label: "Ürün Listesi" },
      {
        href: "/product-list/create-basic/new",
        label: "Basit Ürün Ekle",
        hidden: true,
      },
      {
        href: "/product-list/create-variant/new",
        label: "Varyantlı Ürün Ekle",
        hidden: true,
      },
      { href: "/product-list/categories", label: "Kategoriler" },
      {
        href: "/product-list/categories/new",
        label: "Kategori Ekle",
        hidden: true,
      },
      { href: "/product-list/brands", label: "Markalar" },
      { href: "/product-list/brands/new", label: "Marka Ekle", hidden: true },
      { href: "/product-list/tags", label: "Etiketler" },
      { href: "/product-list/tags/new", label: "Etiket Ekle", hidden: true },
    ],
  },
  {
    label: "Stok Yönetimi",
    icon: <IconForklift size={20} stroke={1.8} />,
    sub: [
      {
        href: "/inventory/location",
        label: "Envanter Yönetimi",
      },
      {
        href: "/inventory/rules",
        label: "Envanter Dağıtım Kuralları",
        tooltip:
          "Stoklarınızı farklı depolara veya mağazalara otomatik olarak dağıtmak için kurallar oluşturun.",
      },
    ],
  },
  {
    label: "Mağaza",
    icon: <IconBuildingStore size={20} stroke={1.8} />,
    sub: [
      { href: "/store", label: "Mağaza" },
      { href: "/store/discounts", label: "İndirimler" },
      { href: "/store/campaigns", label: "Kampanyalar" },
      { href: "/store/campaigns/new", label: "Kampanya Ekle", hidden: true },
    ],
  },
  {
    label: "Siparişler",
    icon: <IconShoppingCart size={20} stroke={1.8} />,
    sub: [
      { href: "/orders", label: "Siparişler" },
      { href: "/carts", label: "Sepetler" },
    ],
  },
  {
    label: "Kullanıcılar",
    icon: <IconUsers size={20} stroke={1.8} />,
    sub: [
      { href: "/customers/customer-list", label: "Kullanıcılar" },
      {
        href: "/customers/customer-groups",
        label: "Müşteri Grupları",
      },
      {
        href: "/customers/customer-groups/new",
        label: "Müşteri Grubu Ekle",
        hidden: true,
      },
    ],
  },
  {
    label: "Tema",
    icon: <IconBrush size={20} stroke={1.8} />,
    sub: [{ href: "/theme", label: "Tema Ayarları" }],
  },
  {
    label: "Ayarlar",
    icon: <IconSettings size={20} stroke={1.8} />,
    sub: [
      { href: "/settings", label: "Ayarlar" },
      { href: "/settings/emails", label: "E-Posta Şablonları" },
      { href: "/settings/payments", label: "Ödeme Ayarları" },
    ],
  },
];

const spotlightIcons: Record<string, React.ReactNode> = {
  "/dashboard": <IconLayoutDashboard size={18} />,
  "/product-list": <IconList size={18} />,
  "/product-list/categories": <IconCategory size={18} />,
  "/product-list/brands": <IconBrandAbstract size={18} />,
  "/product-list/tags": <IconTag size={18} />,
  "/store": <IconBuildingStore size={18} />,
  "/store/discounts": <IconDiscount size={18} />,
  "/store/campaigns": <IconBuildingStore size={18} />,
  "/orders": <IconTruckDelivery size={18} />,
  "/carts": <IconShoppingCart size={18} />,
  "/users/user-list": <IconUsers size={18} />,
  "/theme": <IconBrush size={18} />,
  "/settings": <IconSettings size={18} />,
  "/settings/emails": <IconMail size={18} />,
  "/settings/payments": <IconCreditCard size={18} />,
};

export interface SpotlightItem {
  label: string;
  href: string;
  group: string;
  icon: React.ReactNode;
}

export const getSpotlightItems = (): SpotlightItem[] => {
  const items: SpotlightItem[] = [];

  navGroups.forEach((group) => {
    group.sub.forEach((item) => {
      items.push({
        label: item.label,
        href: item.href,
        group: group.label,
        icon: spotlightIcons[item.href] || group.icon,
      });
    });
  });

  return items;
};

export const findActiveNav = (
  pathname: string
): { groupIndex: number; href: string } => {
  const adminPrefix = "/admin";
  const currentPath = pathname.startsWith(adminPrefix)
    ? pathname.slice(adminPrefix.length)
    : pathname;

  let bestMatchGroup = 0;
  let bestMatchHref = "";
  let bestMatchLength = 0;

  navGroups.forEach((group, groupIndex) => {
    group.sub.forEach((subItem) => {
      if (currentPath === subItem.href) {
        bestMatchLength = Infinity;
        bestMatchGroup = groupIndex;
        bestMatchHref = subItem.href;
        return;
      }

      if (
        currentPath.startsWith(subItem.href) &&
        subItem.href.length > bestMatchLength &&
        bestMatchLength !== Infinity
      ) {
        bestMatchLength = subItem.href.length;
        bestMatchGroup = groupIndex;
        bestMatchHref = subItem.href;
      }
    });
  });

  return { groupIndex: bestMatchGroup, href: bestMatchHref };
};
