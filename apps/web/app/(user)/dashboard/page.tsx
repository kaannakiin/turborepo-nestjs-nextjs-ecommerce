import { getSession } from "@lib/auth";
import { redirect } from "next/navigation";
import React from "react";
import UserInfoForm from "./components/UserInfoForm";

const DashboardMainPage = async () => {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }
  return <UserInfoForm session={session} />;
};

export default DashboardMainPage;
