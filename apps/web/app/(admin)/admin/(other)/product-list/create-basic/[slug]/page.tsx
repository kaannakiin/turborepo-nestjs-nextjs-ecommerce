import {
  BaseProductZodType,
  BrandSelectType,
  CategorySelectType,
} from "@repo/types";
import { cookies } from "next/headers";
import { Params } from "../../../../../../types/GlobalTypes";
import ProductErrorComponent from "../../components/ProductErrorComponent";
import ProductNotFound from "../../components/ProductNotFound";
import BasicProductForm from "./components/BasicProductForm";

const BasicProductFormPage = async ({ params }: { params: Params }) => {
  const { slug } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  const brandResponse = await fetch(
    `${process.env.BACKEND_URL}/admin/products/brands/get-all-brands-without-query`,
    {
      method: "GET",
      headers: {
        Cookie: `token=${token}`,
      },
      credentials: "include",
      cache: "no-cache",
    }
  );
  if (!brandResponse.ok) {
    return <ProductErrorComponent message="Markalar yüklenirken hata oluştu" />;
  }
  const brands = (await brandResponse.json()) as BrandSelectType[];
  const categoryResponse = await fetch(
    `${process.env.BACKEND_URL}/admin/products/categories/get-all-categories-without-query`,
    {
      method: "GET",
      headers: {
        Cookie: `token=${token}`,
      },
      credentials: "include",
      cache: "no-cache",
    }
  );
  if (!categoryResponse.ok) {
    return (
      <ProductErrorComponent message="Kategoriler yüklenirken hata oluştu" />
    );
  }
  const categories = (await categoryResponse.json()) as CategorySelectType[];
  if (slug === "new") {
    return <BasicProductForm categories={categories} brands={brands} />;
  } else {
    const response = await fetch(
      `${process.env.BACKEND_URL}/admin/products/get-basic-product/${slug}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-cache",
        headers: {
          Cookie: `token=${token}`,
        },
      }
    );

    if (response.status === 404) {
      return (
        <ProductNotFound message="Aradığınız ürün sistemde mevcut değil veya silinmiş olabilir." />
      );
    }

    if (!response.ok) {
      console.error("API Error:", response.statusText);
      return <ProductErrorComponent message="Sunucu hatası oluştu" />;
    }
    const responseText = await response.text();

    if (
      !responseText ||
      responseText.trim() === "" ||
      responseText === "null"
    ) {
      return (
        <ProductNotFound message="Aradığınız ürün sistemde mevcut değil veya silinmiş olabilir." />
      );
    }
    let data: BaseProductZodType | null;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      return <ProductErrorComponent message="Veri formatı hatası" />;
    }

    if (!data) {
      return (
        <ProductNotFound message="Aradığınız ürün varyantı sistemde mevcut değil veya silinmiş olabilir." />
      );
    }
    return (
      <BasicProductForm
        defaultValues={data}
        categories={categories}
        brands={brands}
      />
    );
  }
};

export default BasicProductFormPage;
