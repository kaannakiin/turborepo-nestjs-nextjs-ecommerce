import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Params } from "../../../../../../types/GlobalTypes";
import SliderItemForm from "../components/SliderItemForm";
import { SliderItem } from "@repo/types";

const SliderItemFormPage = async ({ params }: { params: Params }) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || null;
  if (!token) {
    return redirect("/auth");
  }

  const { slug } = await params;
  if (!slug) {
    return notFound();
  } else if (slug === "new") {
    return <SliderItemForm />;
  } else {
    const res = await fetch(
      `${process.env.BACKEND_URL}/admin/theme/slider/get-slider-item/${slug}`,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          Cookie: `token=${token}`,
        },
      }
    );
    if (!res.ok) {
      console.log("Slider item fetch error:", res.status, res.statusText);
      return notFound();
    }
    const data = (await res.json()) as SliderItem;

    return <SliderItemForm defaultValues={data} />;
  }
};

export default SliderItemFormPage;
