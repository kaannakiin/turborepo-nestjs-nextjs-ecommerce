import { queryClient } from "@lib/serverQueryClient";
import { CategoryPagePreparePageReturnData } from "@repo/types";
import { Metadata } from "next";
import Script from "next/script";
import { Params, SearchParams } from "types/GlobalTypes";
import CategoryClientPage from "../components/CategoryClientPage";

const fetchCategory = async (slug: string) => {
  try {
    const req = await queryClient.fetchQuery({
      queryKey: ["get-category", slug],
      queryFn: async () => {
        const url = `${process.env.BACKEND_URL}/user-categories/get-category/${slug}`;

        const req = await fetch(url, {
          method: "GET",
        });

        if (!req.ok) {
          console.log("Failed to fetch category data");
          return null;
        }
        const data = (await req.json()) as CategoryPagePreparePageReturnData;
        if (!data.success) {
          return null;
        }
        return data;
      },
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    });
    return req;
  } catch (error) {
    console.log("error", error);
    return null;
  }
};

const generateOgImageUrl = (imageUrl: string): string => {
  const urlWithoutExtension = imageUrl.replace(/\.[^/.]+$/, "");
  return `${urlWithoutExtension}-og.jpg`;
};

const generateBreadcrumbStructuredData = (
  categoryData: CategoryPagePreparePageReturnData,
  slug: string
) => {
  const { hiearchy, category } = categoryData;

  if (!hiearchy?.parentCategories || hiearchy.parentCategories.length === 0) {
    return null;
  }

  const itemListElement = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Ana Sayfa",
      item: process.env.NEXT_PUBLIC_BASE_URL || "https://example.com",
    },
  ];

  hiearchy.parentCategories.forEach((parent, index) => {
    itemListElement.push({
      "@type": "ListItem",
      position: index + 2,
      name: parent.name,
      item: `${process.env.NEXT_PUBLIC_BASE_URL}/categories/${parent.slug}`,
    });
  });

  if (category) {
    itemListElement.push({
      "@type": "ListItem",
      position: itemListElement.length + 1,
      name: category.name,
      item: `${process.env.NEXT_PUBLIC_BASE_URL}/categories/${slug}`,
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };
};

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;

  const categoryData = await fetchCategory(slug);

  if (!categoryData || !categoryData.success || !categoryData.category) {
    return {
      title: "Kategori Bulunamadı",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const { category } = categoryData;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";
  const categoryUrl = `${baseUrl}/categories/${slug}`;

  const title = category.metaTitle || `${category.name}`;

  const description = category.metaDescription || `Kategori: ${category.name}`;

  let ogImageUrl = `${baseUrl}/og-default.jpg`; // Varsayılan
  if (category.category?.image?.url) {
    ogImageUrl = generateOgImageUrl(category.category.image.url);
  }

  const breadcrumbData = generateBreadcrumbStructuredData(categoryData, slug);

  const metadata: Metadata = {
    title,
    description,
    alternates: {
      canonical: categoryUrl,
    },

    // Open Graph
    openGraph: {
      type: "website",
      url: categoryUrl,
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: category.name,
        },
      ],
      siteName: "Site Adı",
      locale: category.locale || "tr_TR",
    },

    // Twitter
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },

    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    // Other metadata
    other: {
      ...(breadcrumbData && {
        "breadcrumb-schema": JSON.stringify(breadcrumbData),
      }),
    },
  };

  return metadata;
}

const CategoriesPage = async ({ params }: { params: Params }) => {
  const { slug } = await params;

  const categoryData = await fetchCategory(slug);

  if (!categoryData || !categoryData.success) {
    return <div>not found</div>;
  }

  const breadcrumbData = generateBreadcrumbStructuredData(categoryData, slug);
  return (
    <>
      {breadcrumbData && (
        <Script
          id="breadcrumb-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbData),
          }}
        />
      )}

      <CategoryClientPage
        brands={categoryData.brands}
        category={categoryData.category}
        hiearchy={categoryData.hiearchy}
        variantGroups={categoryData.variantGroups}
        id={categoryData.category.categoryId}
      />
    </>
  );
};

export default CategoriesPage;
