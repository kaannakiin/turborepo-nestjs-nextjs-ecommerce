"use client";

import { Tabs, Text } from "@mantine/core";
import { useState } from "react";
import { Tab } from "../page";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { useRouter, useSearchParams } from "next/navigation";

interface AuthTabsProps {
  tab: Tab;
}

const AuthTabs = ({ tab }: AuthTabsProps) => {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>(
    (searchParams.get("tab") as Tab) || "login"
  );
  const { replace } = useRouter();

  if (tab === "forgot-password") {
    return (
      <div className=" flex items-center justify-center ">
        <div className="w-full max-w-sm sm:max-w-md bg-white rounded-xl shadow-sm border border-[var(--mantine-primary-color-3)]">
          <div className="p-6 sm:p-8">
            <Text ta="center" size="lg" fw={600} mb="lg">
              Şifremi Unuttum
            </Text>
            <div className="text-center text-gray-500">
              Forgot password form coming soon...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" flex items-center justify-center ">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
        <div className=" rounded-xl shadow-sm border border-gray-200 overflow-hidden bg-[var(--mantine-primary-color-0)]">
          <Tabs
            value={activeTab}
            onChange={(value) => {
              const params = new URLSearchParams(searchParams);
              if (value) {
                setActiveTab(value as Tab);
                params.set("tab", value);
                replace(`?${params.toString()}`);
              }
            }}
            className="w-full"
          >
            <div className="border-b border-gray-100 ">
              <Tabs.List grow className="border-0 bg-transparent h-14 ">
                <Tabs.Tab
                  value="login"
                  className="text-sm font-bold border-0 data-[active=true]:border-b-2  text-gray-600 hover:text-gray-800 rounded-none h-full"
                  style={{
                    backgroundColor: "transparent",
                  }}
                >
                  Giriş Yap
                </Tabs.Tab>
                <Tabs.Tab
                  value="register"
                  className="text-sm font-bold border-0 data-[active=true]:border-b-2  text-gray-600 hover:text-gray-800 rounded-none h-full"
                  style={{
                    backgroundColor: "transparent",
                  }}
                >
                  Üye Ol
                </Tabs.Tab>
              </Tabs.List>
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6 md:p-8">
              <div className="w-full max-w-sm mx-auto">
                <Tabs.Panel value="login">
                  <LoginForm />
                </Tabs.Panel>

                <Tabs.Panel value="register">
                  <RegisterForm />
                </Tabs.Panel>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AuthTabs;
