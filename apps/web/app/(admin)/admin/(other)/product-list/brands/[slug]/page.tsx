import { notFound } from "next/navigation";
import { Params } from "../../../../../../types/GlobalTypes";
import BrandForm from "../components/BrandForm";
import { Brand } from "@repo/types";
import { Button } from "@mantine/core";
import Link from "next/link";
import { cookies } from "next/headers";

interface BrandFormPageProps {
  params: Params;
}

const BrandFormPage = async ({ params }: BrandFormPageProps) => {
  const { slug } = await params;

  if (!slug) return notFound();
  if (slug !== "new" && typeof slug !== "string") return notFound();

  if (slug === "new") {
    return <BrandForm />;
  }

  try {
    const cookieStore = await cookies();
    const brandResponse = await fetch(
      `${process.env.BACKEND_URL}/admin/products/brands/get-brand/${slug}`,
      {
        method: "GET",
        cache: "no-store",
        credentials: "include",
        headers: {
          Cookie: `token=${cookieStore.get("token")?.value || ""}`,
        },
      }
    );

    if (!brandResponse.ok) {
      if (brandResponse.status === 404) {
        return notFound(); // Brand bulunamadı
      }

      // Diğer server hataları
      throw new Error(`Failed to fetch brand: ${brandResponse.status}`);
    }

    const brandData: Brand = await brandResponse.json();

    return <BrandForm defaultValues={brandData} />;
  } catch (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Marka Yüklenemedi
          </h2>
          <p className="text-gray-600 mb-4">
            Marka bilgileri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
          </p>
          <Button component={Link} href="/admin/product-list/brands">
            Markalar listesine dön
          </Button>
        </div>
      </div>
    );
  }
};

export default BrandFormPage;
