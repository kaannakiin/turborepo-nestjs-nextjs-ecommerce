import { Stack } from "@mantine/core";
import { SearchParams } from "../../types/GlobalTypes";
import AuthTabs from "./components/AuthTabs";
import SocialsButtons from "./components/SocialsButtons";

export type Tab = "login" | "register" | "forgot-password";

const AuthPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const pageParams = await searchParams;
  const tab = (pageParams.tab as Tab) || "login";
  return (
    <Stack gap={"xl"}>
      <AuthTabs tab={tab} key={tab} />
      {(tab === "login" || tab === "register") && <SocialsButtons />}
    </Stack>
  );
};

export default AuthPage;
