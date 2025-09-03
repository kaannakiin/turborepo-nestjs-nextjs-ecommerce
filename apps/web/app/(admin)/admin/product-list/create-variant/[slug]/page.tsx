import { VariantProductZodType } from "@repo/types";
import { cookies } from "next/headers";
import { Params } from "../../../../../../types/GlobalTypes";
import VariantProductForm from "../components/VariantProductForm";
import { Center, Title, Paper, Stack, Text, Button } from "@mantine/core";
import { IconAlertCircle, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

const CreateVariantProductPage = async ({ params }: { params: Params }) => {
  const id = (await params).slug;
  const cookieStore = await cookies();

  if (id === "new") {
    return <VariantProductForm />;
  }

  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/admin/products/get-product-variant/${id}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-cache",
        headers: {
          Cookie: `token=${cookieStore.get("token")?.value}`,
        },
      }
    );

    // 404 durumunda özel handling
    if (response.status === 404) {
      return <ProductNotFound />;
    }

    if (!response.ok) {
      console.error("API Error:", response.statusText);
      return <ErrorComponent message="Sunucu hatası oluştu" />;
    }

    const responseText = await response.text();

    if (
      !responseText ||
      responseText.trim() === "" ||
      responseText === "null"
    ) {
      return <ProductNotFound />;
    }

    let data: VariantProductZodType | null;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      return <ErrorComponent message="Veri formatı hatası" />;
    }

    if (!data) {
      return <ProductNotFound />;
    }
    return <VariantProductForm defaultValues={data} />;
  } catch (error) {
    console.error("Fetch Error:", error);
    return <ErrorComponent message="Bağlantı hatası oluştu" />;
  }
};

// Ürün bulunamadı komponenti
const ProductNotFound = () => (
  <Center style={{ minHeight: "60vh" }}>
    <Paper shadow="sm" p="xl" radius="md" withBorder>
      <Stack align="center" gap="md">
        <IconAlertCircle size={48} color="var(--mantine-color-red-6)" />
        <Title order={2} ta="center" c="dimmed">
          Ürün Varyantı Bulunamadı
        </Title>
        <Text ta="center" c="dimmed" size="lg">
          Aradığınız ürün varyantı sistemde mevcut değil veya silinmiş olabilir.
        </Text>
        <Button
          component={Link}
          href="/admin/product-list"
          leftSection={<IconArrowLeft size={16} />}
          variant="light"
          size="md"
        >
          Ürünler Listesine Dön
        </Button>
      </Stack>
    </Paper>
  </Center>
);

// Genel hata komponenti
const ErrorComponent = ({ message }: { message: string }) => (
  <Center style={{ minHeight: "60vh" }}>
    <Paper shadow="sm" p="xl" radius="md" withBorder>
      <Stack align="center" gap="md">
        <IconAlertCircle size={48} color="var(--mantine-color-orange-6)" />
        <Title order={2} ta="center" c="dimmed">
          Bir Hata Oluştu
        </Title>
        <Text ta="center" c="dimmed" size="lg">
          {message}
        </Text>
        <Button
          component={Link}
          href="/admin/product-list"
          leftSection={<IconArrowLeft size={16} />}
          variant="light"
          size="md"
        >
          Ürünler Listesine Dön
        </Button>
      </Stack>
    </Paper>
  </Center>
);

export default CreateVariantProductPage;
