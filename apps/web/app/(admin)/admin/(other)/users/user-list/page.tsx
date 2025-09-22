import { Stack } from "@mantine/core";
import UserTable from "../components/UserTable";

const UserListPage = async () => {
  return (
    <Stack gap={"md"}>
      <UserTable />
    </Stack>
  );
};

export default UserListPage;
