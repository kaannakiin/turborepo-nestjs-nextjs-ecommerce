import { Stack } from "@mantine/core";
import ShippingTable from "./components/ShippingTable";

const ShippingSettingsPage = () => {
  return (
    <Stack gap={"lg"}>
      <ShippingTable />
    </Stack>
  );
};

export default ShippingSettingsPage;
