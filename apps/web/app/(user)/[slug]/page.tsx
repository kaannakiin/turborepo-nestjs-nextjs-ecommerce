import { getQueryClient } from '@lib/serverQueryClient';
import { getOgImageUrl } from '@lib/ui/product-helper';
import { createServerFetch } from '@lib/wrappers/fetchWrapper';
import { dehydrate, HydrationBoundary } from '@repo/shared';
import { ProductDetailType } from '@repo/types';
import { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { notFound } from 'next/navigation';
import { Params } from 'types/GlobalTypes';
import ProductPageClient from './components/ProductPageClient';

interface Props {
  params: Params;
}

const getCachedProductData = unstable_cache(
  async (slug: string) => {
    const api = createServerFetch();
    const response = await api.get<ProductDetailType>(`/product/${slug}`);

    if (!response.success) {
      return null;
    }

    return response.data;
  },
  ['product-data'],
  {
    revalidate: 60,
    tags: ['product'],
  },
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug as string;
  const product = await getCachedProductData(slug);

  if (!product) {
    return {
      title: 'Ürün Bulunamadı',
      description: 'Aradığınız ürün bulunamadı.',
      robots: { index: false, follow: false },
    };
  }

  const translation = product.translations[0];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const productUrl = `${baseUrl}/${slug}`;

  const title = translation?.metaTitle || translation?.name || 'Ürün';
  const description =
    translation?.metaDescription ||
    translation?.description ||
    `${translation?.name} - En uygun fiyatlarla hemen satın al!`;

  const mainImage = product.assets[0]?.asset?.url;

  return {
    title,
    description,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      type: 'website',
      url: productUrl,
      title,
      description,
      ...(mainImage && {
        images: [
          {
            url: getOgImageUrl(mainImage),
            width: 1200,
            height: 630,
            alt: translation?.name,
          },
        ],
      }),
    },
    twitter: {
      card: mainImage ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(mainImage && { images: [getOgImageUrl(mainImage)] }),
    },
  };
}

const ProductPage = async ({ params }: Props) => {
  const slug = (await params).slug as string;

  const product = await getCachedProductData(slug);

  if (!product) {
    notFound();
  }

  const queryClient = getQueryClient();
  queryClient.setQueryData(['product', slug], product);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductPageClient slug={slug} />
    </HydrationBoundary>
  );
};

export default ProductPage;
