"use client";

import {
  ActionIcon,
  Alert,
  Box,
  Card,
  Group,
  Modal,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  IconChevronRight,
  IconInfoCircle,
  IconSparkles,
  IconTicket,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";

interface DiscountGenericTypeModalProps {
  opened: boolean;
  onClose: () => void;
}
const DiscountGenericTypeModal = ({
  opened,
  onClose,
}: DiscountGenericTypeModalProps) => {
  const { push } = useRouter();
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={"lg"}
      title="İndirim Türü Seçin"
    >
      <Stack gap={"lg"}>
        <Card
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          style={{ cursor: "pointer", transition: "all 0.2s ease" }}
          className="hover:shadow-md hover:border-[var(--mantine-primary-color-9)]"
          onClick={() => {
            close();
            push("/admin/store/discounts/new?type=MANUAL");
          }}
        >
          <Group justify="space-between" align="flex-start">
            <Box flex={1}>
              <Group gap="sm" mb="xs">
                <ThemeIcon size="lg" variant="light" color="admin">
                  <IconTicket size={20} />
                </ThemeIcon>
                <Box>
                  <Text size="lg" fw={600} c="admin">
                    Manuel İndirim
                  </Text>
                  <Text size="xs" c="dimmed">
                    Kupon Kodu ile
                  </Text>
                </Box>
              </Group>

              <Text size="sm" c="dimmed" mb="md">
                Kullanıcıların kupon kodu girmesi gereken indirimler. Yüzde,
                sabit tutar veya ücretsiz kargo indirimleri oluşturabilirsiniz.
              </Text>
            </Box>

            <ActionIcon variant="light" color="admin" size="sm">
              <IconChevronRight size={16} />
            </ActionIcon>
          </Group>
        </Card>

        <Card
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          style={{ cursor: "pointer", transition: "all 0.2s ease" }}
          className="hover:shadow-md hover:border-[var(--mantine-primary-color-9)]"
          onClick={() => {
            close();
            push("/admin/store/discounts/new?type=AUTOMATIC");
          }}
        >
          <Group justify="space-between" align="flex-start">
            <Box flex={1}>
              <Group gap="sm" mb="xs">
                <ThemeIcon size="lg" variant="light" color="admin">
                  <IconSparkles size={20} />
                </ThemeIcon>
                <Box>
                  <Text size="lg" fw={600} c="admin">
                    Otomatik İndirim
                  </Text>
                  <Text size="xs" c="dimmed">
                    Koşul Bazlı
                  </Text>
                </Box>
              </Group>

              <Text size="sm" c="dimmed" mb="md">
                Belirli koşullar sağlandığında otomatik uygulanan indirimler.
                Minimum sepet tutarı, &quot;X Al Y Kazan&quot; gibi akıllı
                kampanyalar.
              </Text>
            </Box>

            <ActionIcon variant="light" color="admin" size="sm">
              <IconChevronRight size={16} />
            </ActionIcon>
          </Group>
        </Card>

        <Alert
          icon={<IconInfoCircle size={16} />}
          color="admin"
          variant="light"
          radius="md"
        >
          <Text size="sm">
            <Text component="span" fw={500}>
              İpucu:
            </Text>{" "}
            Manuel indirimler kupon kodu gerektirir, otomatik indirimler ise
            belirlediğiniz koşullar sağlandığında kendiliğinden uygulanır.
          </Text>
        </Alert>
      </Stack>
    </Modal>
  );
};

export default DiscountGenericTypeModal;
