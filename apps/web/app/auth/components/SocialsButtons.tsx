"use client";
import { ActionIcon, Group, Text } from "@mantine/core";
import Image from "next/image";
import { useRouter } from "next/navigation";

const SocialsButtons = () => {
  const { push } = useRouter();
  const baseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
        <div className="p-5 rounded-xl shadow-sm  bg-[var(--mantine-primary-color-0)]">
          <Text fz="sm" ta="center" c="primary.9" mb="md">
            Sosyal hesabın ile giriş yap
          </Text>

          <Group justify="center" gap="sm">
            <ActionIcon
              variant="outline"
              size={48}
              radius="md"
              className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
              style={{
                borderColor: "#e9ecef",
                backgroundColor: "white",
              }}
            >
              <Image
                src="/apple-icon.svg"
                alt="Apple"
                width={20}
                height={20}
                priority
              />
            </ActionIcon>

            <ActionIcon
              variant="outline"
              onClick={() => {
                push(`${baseUrl}/auth/google`);
              }}
              size={48}
              radius="md"
              className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
              style={{
                borderColor: "#e9ecef",
                backgroundColor: "white",
              }}
            >
              <Image
                src="/google-icon.svg"
                alt="Google"
                width={20}
                height={20}
                priority
              />
            </ActionIcon>

            <ActionIcon
              variant="outline"
              size={48}
              radius="md"
              onClick={() => {
                push(`${baseUrl}/auth/facebook`);
              }}
              className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
              style={{
                borderColor: "#e9ecef",
                backgroundColor: "white",
              }}
            >
              <Image
                src="/facebook-icon.svg"
                alt="Facebook"
                width={20}
                height={20}
                priority
              />
            </ActionIcon>
          </Group>
        </div>
      </div>
    </div>
  );
};

export default SocialsButtons;
