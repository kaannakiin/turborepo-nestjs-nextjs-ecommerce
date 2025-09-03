import { Stack } from "@mantine/core";
import ProductTable from "./components/ProductTable";

const ProductList = async () => {
  return (
    <Stack gap={"xl"}>
      <ProductTable />
    </Stack>
  );
};

export default ProductList;
