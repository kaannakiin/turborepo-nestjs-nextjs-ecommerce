import { QueryClient } from '@repo/shared';
import { CargoZoneType } from '@repo/types';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Params } from 'types/types';
import ShippingForm from '../components/ShippingForm';

const ShippingFormPage = async ({ params }: { params: Params }) => {
  const { slug } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value || null;
  if (!token) {
    return notFound();
  }
  if (slug === 'new') {
    return <ShippingForm />;
  } else {
    const client = new QueryClient();
    const shipping = await client.fetchQuery({
      queryKey: ['shipping', slug],
      queryFn: async () => {
        const url = `${process.env.BACKEND_URL}/shipping/get-cargo-zone/${slug}`;
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            Cookie: `token=${token}`,
          },
        });
        if (!res.ok) {
          return notFound();
        }
        const data = (await res.json()) as
          | CargoZoneType
          | { success: false; message: string };
        if ('success' in data && data.success === false) {
          return notFound();
        }
        return data;
      },
    });
    return <ShippingForm defaultValues={shipping as CargoZoneType} />;
  }
};

export default ShippingFormPage;
