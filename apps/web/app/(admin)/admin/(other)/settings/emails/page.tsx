"use client";

import {
  Button,
  Card,
  Group,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconReceiptRefund,
  IconShoppingBag,
  IconSpeakerphone,
  IconTruck,
  IconUser,
} from "@tabler/icons-react";

type MailTemplate = {
  id: string;
  label: string;
  description: string;
};

type TabValue = "orders" | "shipping" | "refunds" | "customer" | "marketing";

const tabs: Array<{
  value: TabValue;
  label: string;
  icon: React.ReactNode;
  templates: MailTemplate[];
}> = [
  {
    value: "orders",
    icon: <IconShoppingBag />,
    label: "Siparişler",
    templates: [
      {
        id: "order-confirmation",
        label: "Sipariş Onayı",
        description:
          "Müşteriye, siparişinin başarıyla alındığını bildiren e-posta.",
      },
      {
        id: "order-processing",
        label: "Sipariş Hazırlanıyor",
        description: "Siparişin hazırlanmaya başlandığını müşteriye bildirir.",
      },
      {
        id: "order-ready-to-ship",
        label: "Sipariş Kargoya Hazır",
        description:
          "Siparişin paketlendiğini ve kargoya verilmeye hazır olduğunu bildirir.",
      },
      {
        id: "order-cancelled",
        label: "Sipariş İptal Edildi",
        description:
          "Sipariş müşteri veya mağaza sahibi tarafından iptal edildiğinde gönderilir.",
      },
      {
        id: "payment-received",
        label: "Ödeme Alındı",
        description:
          "Havale/EFT ile yapılan ödemeler onaylandığında gönderilir.",
      },
      {
        id: "payment-failed",
        label: "Ödeme Başarısız",
        description:
          "Ödeme işlemi başarısız olduğunda müşteriye bilgilendirme gönderilir.",
      },
      {
        id: "payment-reminder",
        label: "Ödeme Hatırlatma",
        description:
          "Havale/EFT bekleyen siparişler için ödeme hatırlatması gönderilir.",
      },
      {
        id: "admin-new-order",
        label: "Yeni Sipariş Bildirimi (Mağaza Sahibi)",
        description:
          "Yeni bir sipariş geldiğinde mağaza yetkililerine gönderilir.",
      },
      {
        id: "admin-payment-received",
        label: "Ödeme Alındı Bildirimi (Mağaza Sahibi)",
        description:
          "Ödeme tamamlandığında mağaza yetkililerine bildirim gönderilir.",
      },
    ],
  },
  {
    value: "shipping",
    icon: <IconTruck />,
    label: "Kargo",
    templates: [
      {
        id: "order-shipped",
        label: "Sipariş Kargoya Verildi",
        description:
          "Müşterinin paketi yola çıktığında kargo takip numarası ile birlikte gönderilir.",
      },
      {
        id: "order-in-transit",
        label: "Sipariş Yolda",
        description:
          "Paket transfer merkezine ulaştığında veya şubeler arası aktarımda bilgilendirme yapılır.",
      },
      {
        id: "order-out-for-delivery",
        label: "Sipariş Dağıtımda",
        description:
          "Paket müşterinin adresine teslim edilmek üzere kurye'de olduğunda gönderilir.",
      },
      {
        id: "order-delivered",
        label: "Sipariş Teslim Edildi",
        description:
          "Paket müşteriye teslim edildiğinde bir onay e-postası gönderilir.",
      },
      {
        id: "delivery-failed",
        label: "Teslimat Başarısız",
        description:
          "Adres hatalı veya müşteriye ulaşılamadığında bilgilendirme yapılır.",
      },
      {
        id: "shipping-delayed",
        label: "Kargo Gecikmesi",
        description:
          "Kargo sürecinde beklenmedik gecikmeler olduğunda müşteriye bilgi verilir.",
      },
      {
        id: "delivery-attempt",
        label: "Teslimat Denemesi",
        description:
          "Kargo teslim edilemediğinde ikinci teslimat için bilgilendirme yapılır.",
      },
    ],
  },
  {
    value: "refunds",
    icon: <IconReceiptRefund />,
    label: "İadeler",
    templates: [
      {
        id: "refund-request-received",
        label: "İade Talebi Alındı",
        description:
          "Müşterinin iade talebinin alındığını ve inceleneceğini bildirir.",
      },
      {
        id: "refund-approved",
        label: "İade Onaylandı",
        description:
          "İade talebinin onaylandığını ve ürünün geri gönderimi için talimatları içerir.",
      },
      {
        id: "refund-rejected",
        label: "İade Reddedildi",
        description: "İade talebinin neden reddedildiğini açıklayan e-posta.",
      },
      {
        id: "refund-product-received",
        label: "İade Ürünü Alındı",
        description:
          "Müşterinin gönderdiği iade ürününün depoya ulaştığını bildirir.",
      },
      {
        id: "refund-processed",
        label: "İade Tutarı Yansıtıldı",
        description:
          "İade tutarının müşterinin hesabına/kartına yansıtıldığını bildirir.",
      },
      {
        id: "exchange-request-received",
        label: "Değişim Talebi Alındı",
        description:
          "Ürün değişim talebinin alındığını ve işleme konulduğunu bildirir.",
      },
      {
        id: "exchange-approved",
        label: "Değişim Onaylandı",
        description:
          "Değişim talebinin onaylandığını ve yeni ürünün gönderileceğini bildirir.",
      },
      {
        id: "admin-refund-request",
        label: "İade Talebi Bildirimi (Mağaza Sahibi)",
        description:
          "Yeni bir iade talebi geldiğinde mağaza yetkililerine gönderilir.",
      },
    ],
  },
  {
    value: "customer",
    icon: <IconUser />,
    label: "Müşteri",
    templates: [
      {
        id: "customer-welcome",
        label: "Hoş Geldiniz E-postası",
        description:
          "Yeni üye olan müşterilere gönderilen karşılama ve hesap aktivasyon e-postası.",
      },
      {
        id: "email-verification",
        label: "E-posta Doğrulama",
        description:
          "Yeni üyelik veya e-posta değişikliğinde doğrulama linki içerir.",
      },
      {
        id: "password-reset",
        label: "Şifre Sıfırlama",
        description:
          "Müşteri şifresini unuttuğunda gönderilen sıfırlama linkini içerir.",
      },
      {
        id: "password-changed",
        label: "Şifre Değiştirildi",
        description:
          "Hesap şifresi başarıyla değiştirildiğinde güvenlik bildirimi gönderilir.",
      },
      {
        id: "account-updated",
        label: "Hesap Bilgileri Güncellendi",
        description:
          "Müşteri hesap bilgilerini değiştirdiğinde onay e-postası.",
      },
      {
        id: "address-added",
        label: "Yeni Adres Eklendi",
        description:
          "Müşteri hesabına yeni teslimat adresi eklendiğinde bildirim gönderilir.",
      },
      {
        id: "wishlist-reminder",
        label: "Favori Liste Hatırlatma",
        description:
          "Favori listesindeki ürünlerde indirim olduğunda müşteriye bildirim gönderilir.",
      },
      {
        id: "review-request",
        label: "Ürün Değerlendirme Talebi",
        description:
          "Sipariş teslim edildikten sonra müşteriye ürün yorumu için davet e-postası.",
      },
      {
        id: "review-thank-you",
        label: "Değerlendirme Teşekkürü",
        description:
          "Müşteri yorum yaptıktan sonra teşekkür e-postası gönderilir.",
      },
    ],
  },
  {
    value: "marketing",
    icon: <IconSpeakerphone />, // Bu ikonu import etmen gerekecek
    label: "Pazarlama",
    templates: [
      {
        id: "abandoned-cart",
        label: "Terk Edilmiş Sepet Hatırlatma",
        description:
          "Sepetine ürün ekleyip alışverişi tamamlamayan müşterilere hatırlatma gönderilir.",
      },
      {
        id: "abandoned-cart-second",
        label: "Terk Edilmiş Sepet - 2. Hatırlatma",
        description:
          "İlk hatırlatmadan sonra hala alışveriş yapmayan müşterilere ikinci hatırlatma.",
      },
      {
        id: "back-in-stock",
        label: "Ürün Tekrar Stokta",
        description:
          "Tükenen ürün için bildirim isteyen müşterilere stok geldiğinde bilgi verilir.",
      },
      {
        id: "price-drop",
        label: "Fiyat Düşüşü Bildirimi",
        description:
          "İzlenen veya sepetteki ürünlerde fiyat düştüğünde bildirim gönderilir.",
      },
      {
        id: "newsletter-subscription",
        label: "Bülten Aboneliği Onayı",
        description:
          "Müşteri bültene abone olduğunda gönderilen onay e-postası (double opt-in).",
      },
      {
        id: "newsletter-welcome",
        label: "Bültene Hoş Geldiniz",
        description:
          "Bülten aboneliği onaylandıktan sonra karşılama e-postası.",
      },
      {
        id: "win-back",
        label: "Geri Kazanım Kampanyası",
        description:
          "Uzun süredir alışveriş yapmayan müşterilere özel tekliflerle geri dönüş daveti.",
      },
      {
        id: "birthday-discount",
        label: "Doğum Günü Kutlaması",
        description:
          "Müşterinin doğum gününde özel indirim kuponu ile kutlama e-postası.",
      },
      {
        id: "vip-customer",
        label: "VIP Müşteri Bildirimi",
        description:
          "Belirli alışveriş miktarına ulaşan müşterilere VIP statüsü ve ayrıcalıkları bildirir.",
      },
      {
        id: "referral-program",
        label: "Arkadaşını Getir Kampanyası",
        description:
          "Müşterilere referans programı ve kazanç fırsatlarını tanıtan e-posta.",
      },
    ],
  },
];

const MailTemplateCard = ({ template }: { template: MailTemplate }) => {
  return (
    <Card withBorder p="sm" radius="md">
      <Group justify="space-between" wrap="nowrap">
        <Stack gap={0}>
          <Text fw={500}>{template.label}</Text>
          <Text fz="sm" c="dimmed">
            {template.description}
          </Text>
        </Stack>
        <Group>
          <Button variant="default" size="sm">
            Şablonu Düzenle
          </Button>
        </Group>
      </Group>
    </Card>
  );
};

const AdminMailPage = () => {
  return (
    <Stack gap={"lg"}>
      <Title c={"primary"} order={1}>
        (TODO) BU ÖZELLİK ŞUANDA KULLANILAMIYOR
      </Title>
      <Card withBorder radius={"md"} p="lg">
        <Group justify="space-between" align="center">
          <Title order={4}>E-Posta Bildirimleri</Title>
        </Group>
        <Text fz="sm" c="dimmed" mt={4}>
          Müşterilerinize sipariş, kargo ve hesaplarıyla ilgili otomatik
          e-postaları buradan yönetebilirsiniz.
        </Text>
      </Card>

      <Card withBorder radius={"md"} p={0}>
        <Tabs defaultValue={tabs[0].value} orientation="vertical">
          <Tabs.List miw={200} p="md">
            {tabs.map((tab) => (
              <Tabs.Tab key={tab.value} value={tab.value} p={"0"}>
                <Group gap={"2px"}>
                  <ThemeIcon size={"xl"} variant="transparent">
                    {tab.icon}
                  </ThemeIcon>
                  <Text fz={"sm"} c={"admin"} fw={700}>
                    {tab.label}
                  </Text>
                </Group>
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {tabs.map((tab) => (
            <Tabs.Panel
              key={tab.value}
              value={tab.value}
              p="md"
              className="flex flex-col gap-3"
            >
              <Title order={5}>{tab.label} Bildirimleri</Title>
              <ScrollArea h={400} scrollbarSize={4}>
                <Stack gap={"sm"}>
                  {tab.templates.map((template) => (
                    <MailTemplateCard key={template.id} template={template} />
                  ))}
                </Stack>
              </ScrollArea>
            </Tabs.Panel>
          ))}
        </Tabs>
      </Card>
    </Stack>
  );
};

export default AdminMailPage;
