import { cookies } from "next/headers";
import DiscountForm from "../components/DiscountForm";
import { notFound } from "next/navigation";
import { Params } from "types/GlobalTypes";

const DiscountFormPage = async ({ params }: { params: Params }) => {
  const { slug } = await params;
  if (slug === "new") {
    return <DiscountForm />;
  } else {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const res = await fetch(
      `${process.env.BACKEND_URL}/discounts/get-discount-for-admin/${slug}`,
      {
        method: "GET",
        headers: {
          Cookie: `token=${token}`,
        },
        cache: "no-store",
      }
    );
    if (!res.ok) {
      return notFound();
    }
    const defaultValues = await res.json();
    return <DiscountForm defaultValues={defaultValues} />;
  }
};

export default DiscountFormPage;
