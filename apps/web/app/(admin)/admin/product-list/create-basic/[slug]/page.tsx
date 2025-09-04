import { Params } from "../../../../../../types/GlobalTypes";
import BasicProductForm from "./components/BasicProductForm";

const BasicProductFormPage = async ({ params }: { params: Params }) => {
  const { slug } = await params;
  if (slug === "new") {
    return <BasicProductForm />;
  } else {
    return <BasicProductForm />;
  }
};

export default BasicProductFormPage;
