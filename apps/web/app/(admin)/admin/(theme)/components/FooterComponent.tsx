"use client";
import {
  Accordion,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { MainPageComponentsType } from "@repo/types";
import { useTheme } from "../ThemeContexts/ThemeContext";

interface FooterComponentProps {
  footerData: MainPageComponentsType["footer"];
}

const FooterComponent = ({ footerData }: FooterComponentProps) => {
  const { media } = useTheme();

  if (media === "desktop") {
    return (
      <div
        className="w-full"
        style={{
          backgroundColor:
            footerData.options.backgroundColor ||
            "var(--mantine-primary-color-9)",
        }}
      >
        <div className="max-w-[1500px] mx-auto">
          <div className="flex flex-col">
            <div className="py-16 px-4">
              <SimpleGrid cols={5} spacing="xl">
                {footerData.linkGroups
                  .map((group) => (
                    <Stack key={group.uniqueId} gap="lg" align="start">
                      {group.title && (
                        <Title
                          fz={footerData.options.titleFontSize}
                          c={footerData.options.titleColor}
                          fw={500}
                        >
                          {group.title}
                        </Title>
                      )}
                      <Stack gap="sm">
                        {group.links.map((link) => (
                          <Text
                            key={link.uniqueId}
                            fz={footerData.options.textFontSize}
                            c={footerData.options.textColor}
                            className="cursor-pointer transition-all duration-200 hover:opacity-70 hover:translate-x-1"
                            onClick={() => {}}
                            size="sm"
                          >
                            {link.title}
                          </Text>
                        ))}
                      </Stack>
                    </Stack>
                  ))
                  .slice(0, 5)}
              </SimpleGrid>
            </div>

            {/* Footer Bottom */}
            <div className="border-t border-white/10">
              <div className="py-8 px-4">
                <Group justify="space-between" align="center">
                  <Text size="sm" c="gray.4">
                    © 2024 Your Company. Tüm hakları saklıdır.
                  </Text>
                  <Group gap="md">
                    <Text
                      size="sm"
                      c="gray.4"
                      className="cursor-pointer hover:text-white transition-colors"
                    >
                      Gizlilik Politikası
                    </Text>
                    <Text
                      size="sm"
                      c="gray.4"
                      className="cursor-pointer hover:text-white transition-colors"
                    >
                      Kullanım Şartları
                    </Text>
                  </Group>
                </Group>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div
        className="w-full"
        style={{
          backgroundColor:
            footerData.options.backgroundColor ||
            "var(--mantine-primary-color-9)",
        }}
      >
        <div className="px-4 py-8">
          {/* Mobile Accordion */}
          <Stack gap="xs">
            {footerData.linkGroups.map((group) => (
              <Accordion
                key={group.uniqueId}
                classNames={{
                  control: "bg-transparent text-white ",
                  item: "border-none border-b border-white/10 last:border-b-0",
                  content: "pt-0 pb-4",
                  chevron: "text-white",
                  panel: "py-2",
                }}
                radius={0}
              >
                <Accordion.Item value={group.uniqueId}>
                  <Accordion.Control>
                    <Title
                      order={5}
                      fz={footerData.options.titleFontSize}
                      c={footerData.options.titleColor}
                      fw={500}
                    >
                      {group.title}
                    </Title>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Stack gap="sm">
                      {group.links.map((link) => (
                        <Text
                          key={link.uniqueId}
                          size="sm"
                          fz={footerData.options.textFontSize}
                          c={footerData.options.textColor}
                          className="cursor-pointer"
                          onClick={() => {}}
                        >
                          {link.title}
                        </Text>
                      ))}
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            ))}
          </Stack>

          {/* Mobile Footer Bottom */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <Stack gap="md" align="center">
              <Text size="sm" c="gray.4" ta="center">
                © 2024 Your Company. Tüm hakları saklıdır.
              </Text>
              <Group gap="md">
                <Text
                  size="sm"
                  c="gray.4"
                  className="cursor-pointer hover:text-white transition-colors"
                >
                  Gizlilik Politikası
                </Text>
                <Text
                  size="sm"
                  c="gray.4"
                  className="cursor-pointer hover:text-white transition-colors"
                >
                  Kullanım Şartları
                </Text>
              </Group>
            </Stack>
          </div>
        </div>
      </div>
    );
  }
};

export default FooterComponent;
