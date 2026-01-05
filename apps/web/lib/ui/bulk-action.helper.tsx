import { ProductBulkAction } from "@repo/types";
import {
  IconBarcode,
  IconBoxSeam,
  IconCategory,
  IconCurrencyLira,
  IconDownload,
  IconEye,
  IconEyeOff,
  IconPackage,
  IconTag,
  IconTrash,
  IconTruckDelivery,
} from "@tabler/icons-react";
import { ReactNode } from "react";

interface BulkActionConfig {
  key: ProductBulkAction;
  label: string;
  icon: ReactNode;
  color?: string;
  group: string;
  messages: {
    loading: string;
    success: string;
    error: string;
  };
  needsModal?: boolean;
}

export const BULK_ACTION_CONFIG: Record<ProductBulkAction, BulkActionConfig> = {
  activate: {
    key: "activate",
    label: "Aktif Yap",
    icon: <IconEye size={16} />,
    color: "green",
    group: "Durum",
    messages: {
      loading: "Ürünler aktif yapılıyor...",
      success: "Ürünler aktif yapıldı",
      error: "Ürünler aktif yapılırken hata oluştu",
    },
  },
  deactivate: {
    key: "deactivate",
    label: "Pasif Yap",
    icon: <IconEyeOff size={16} />,
    color: "orange",
    group: "Durum",
    messages: {
      loading: "Ürünler pasif yapılıyor...",
      success: "Ürünler pasif yapıldı",
      error: "Ürünler pasif yapılırken hata oluştu",
    },
  },
  delete: {
    key: "delete",
    label: "Sil",
    icon: <IconTrash size={16} />,
    color: "red",
    group: "Durum",
    needsModal: true,
    messages: {
      loading: "Ürünler siliniyor...",
      success: "Ürünler silindi",
      error: "Ürünler silinirken hata oluştu",
    },
  },
  "assign-category": {
    key: "assign-category",
    label: "Kategoriye Ekle",
    icon: <IconCategory size={16} />,
    group: "Organizasyon",
    needsModal: true,
    messages: {
      loading: "Kategori atanıyor...",
      success: "Kategori atandı",
      error: "Kategori atanırken hata oluştu",
    },
  },
  "remove-category": {
    key: "remove-category",
    label: "Kategoriden Çıkar",
    icon: <IconCategory size={16} />,
    group: "Organizasyon",
    needsModal: true,
    messages: {
      loading: "Kategori kaldırılıyor...",
      success: "Kategori kaldırıldı",
      error: "Kategori kaldırılırken hata oluştu",
    },
  },
  "assign-brand": {
    key: "assign-brand",
    label: "Marka Ata",
    icon: <IconPackage size={16} />,
    group: "Organizasyon",
    needsModal: true,
    messages: {
      loading: "Marka atanıyor...",
      success: "Marka atandı",
      error: "Marka atanırken hata oluştu",
    },
  },
  "assign-tags": {
    key: "assign-tags",
    label: "Etiket Ekle",
    icon: <IconTag size={16} />,
    group: "Etiketler",
    needsModal: true,
    messages: {
      loading: "Etiketler ekleniyor...",
      success: "Etiketler eklendi",
      error: "Etiketler eklenirken hata oluştu",
    },
  },
  "remove-tags": {
    key: "remove-tags",
    label: "Etiket Çıkar",
    icon: <IconTag size={16} />,
    group: "Etiketler",
    needsModal: true,
    messages: {
      loading: "Etiketler kaldırılıyor...",
      success: "Etiketler kaldırıldı",
      error: "Etiketler kaldırılırken hata oluştu",
    },
  },
  "update-price-percent": {
    key: "update-price-percent",
    label: "Fiyat Güncelle (%)",
    icon: <IconCurrencyLira size={16} />,
    group: "Fiyat & Stok",
    needsModal: true,
    messages: {
      loading: "Fiyatlar güncelleniyor...",
      success: "Fiyatlar güncellendi",
      error: "Fiyatlar güncellenirken hata oluştu",
    },
  },
  "update-price-fixed": {
    key: "update-price-fixed",
    label: "Fiyat Güncelle (₺)",
    icon: <IconCurrencyLira size={16} />,
    group: "Fiyat & Stok",
    needsModal: true,
    messages: {
      loading: "Fiyatlar güncelleniyor...",
      success: "Fiyatlar güncellendi",
      error: "Fiyatlar güncellenirken hata oluştu",
    },
  },
  "update-stock": {
    key: "update-stock",
    label: "Stok Güncelle",
    icon: <IconPackage size={16} />,
    group: "Fiyat & Stok",
    needsModal: true,
    messages: {
      loading: "Stoklar güncelleniyor...",
      success: "Stoklar güncellendi",
      error: "Stoklar güncellenirken hata oluştu",
    },
  },
  "inventory-track-on": {
    key: "inventory-track-on",
    label: "Stok Takibini Aç",
    icon: <IconBoxSeam size={16} />,
    group: "Envanter Ayarları",
    messages: {
      loading: "Stok takibi açılıyor...",
      success: "Stok takibi açıldı",
      error: "Stok takibi açılırken hata oluştu",
    },
  },
  "inventory-track-off": {
    key: "inventory-track-off",
    label: "Stok Takibini Kapat",
    icon: <IconBoxSeam size={16} />,
    group: "Envanter Ayarları",
    messages: {
      loading: "Stok takibi kapatılıyor...",
      success: "Stok takibi kapatıldı",
      error: "Stok takibi kapatılırken hata oluştu",
    },
  },
  "inventory-allow-negative": {
    key: "inventory-allow-negative",
    label: "Negatif Stoğa İzin Ver",
    icon: <IconBoxSeam size={16} />,
    group: "Envanter Ayarları",
    messages: {
      loading: "Ayar güncelleniyor...",
      success: "Negatif stok izni verildi",
      error: "Ayar güncellenirken hata oluştu",
    },
  },
  "assign-supplier": {
    key: "assign-supplier",
    label: "Tedarikçi Ata",
    icon: <IconTruckDelivery size={16} />,
    group: "Envanter Ayarları",
    needsModal: true,
    messages: {
      loading: "Tedarikçi atanıyor...",
      success: "Tedarikçi atandı",
      error: "Tedarikçi atanırken hata oluştu",
    },
  },
  "print-barcode": {
    key: "print-barcode",
    label: "Barkod Etiketi Yazdır",
    icon: <IconBarcode size={16} />,
    group: "Çıktı & İşlemler",
    messages: {
      loading: "Barkodlar hazırlanıyor...",
      success: "Barkodlar hazırlandı",
      error: "Barkodlar hazırlanırken hata oluştu",
    },
  },
  "export-excel": {
    key: "export-excel",
    label: "Seçilileri Excel İndir",
    icon: <IconDownload size={16} />,
    group: "Çıktı & İşlemler",
    messages: {
      loading: "Excel hazırlanıyor...",
      success: "Excel indirildi",
      error: "Excel hazırlanırken hata oluştu",
    },
  },
  "assign-taxonomy": {
    key: "assign-taxonomy",
    label: "Google Kategorisi Ata",
    icon: <IconCategory size={16} />,
    group: "Organizasyon",
    needsModal: true,
    messages: {
      loading: "Google kategorisi atanıyor...",
      success: "Google kategorisi atandı",
      error: "Google kategorisi atanırken hata oluştu",
    },
  },
  "inventory-deny-negative": {
    key: "inventory-deny-negative",
    label: "Negatif Stoğu Kapat",
    icon: <IconBoxSeam size={16} />,
    group: "Envanter Ayarları",
    messages: {
      loading: "Ayar güncelleniyor...",
      success: "Negatif stok kapatıldı",
      error: "Ayar güncellenirken hata oluştu",
    },
  },
};

export const getBulkActionConfig = (action: ProductBulkAction) =>
  BULK_ACTION_CONFIG[action];

export const getBulkActionMessages = (action: ProductBulkAction) =>
  BULK_ACTION_CONFIG[action].messages;

export const needsModal = (action: ProductBulkAction) =>
  BULK_ACTION_CONFIG[action].needsModal ?? false;

export const getGroupedActions = () => {
  return Object.values(BULK_ACTION_CONFIG).reduce(
    (acc, action) => {
      if (!acc[action.group]) {
        acc[action.group] = [];
      }
      acc[action.group].push(action);
      return acc;
    },
    {} as Record<string, BulkActionConfig[]>
  );
};
