"use client";

import { Select, SelectProps } from "@mantine/core";
import { LocationType } from "@repo/database/client";
import { getInventoryLocationTypeLabel } from "@repo/shared";

type AdminInventoryLocationTypeSelectProps = Omit<SelectProps, "data">;

const AdminInventoryLocationTypeSelect = (
  props: AdminInventoryLocationTypeSelectProps
) => {
  return (
    <Select
      {...props}
      data={Object.keys(LocationType).map((key: LocationType) => ({
        value: key,
        label: getInventoryLocationTypeLabel(key),
      }))}
    />
  );
};

export default AdminInventoryLocationTypeSelect;
