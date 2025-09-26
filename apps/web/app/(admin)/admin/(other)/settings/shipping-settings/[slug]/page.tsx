import { Params } from "types/GlobalTypes";
import ShippingForm from "../components/ShippingForm";

const ShippingFormPage = async ({ params }: { params: Params }) => {
  const { slug } = await params;
  if (slug === "new") return <ShippingForm />;
  return <div>ShippingFormPage</div>;
};

export default ShippingFormPage;
