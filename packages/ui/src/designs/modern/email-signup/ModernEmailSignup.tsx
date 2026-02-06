"use client";

import {
  Box,
  Button,
  Card,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { EmailSignupPreviewProps } from "@repo/types";
import { IconMail } from "@tabler/icons-react";

const ModernEmailSignup = ({
  data,
  isSelected,
  onSelect,
}: EmailSignupPreviewProps) => {
  const alignmentStyle = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  }[data.alignment || "center"];

  return (
    <Card
      withBorder
      p={0}
      onClick={onSelect}
      style={{
        cursor: "pointer",
        borderColor: isSelected ? "var(--mantine-color-blue-6)" : undefined,
        borderWidth: isSelected ? 2 : 1,
        overflow: "hidden",
      }}
    >
      <Box
        style={{
          minHeight: data.minHeight || 300,
          backgroundColor:
            data.backgroundColor || "var(--mantine-color-gray-8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          padding: `${data.paddingVertical || 48}px ${data.paddingHorizontal || 24}px`,
        }}
      >
        {data.backgroundImage && (
          <Box
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: `rgba(0, 0, 0, ${(data.overlayOpacity || 50) / 100})`,
            }}
          />
        )}

        <Stack
          align={alignmentStyle as "center" | "flex-start" | "flex-end"}
          gap="md"
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: 500,
          }}
        >
          {data.title && (
            <Title
              order={3}
              style={{
                color: data.titleColor || "#FFFFFF",
                fontSize:
                  data.titleSize === "xs"
                    ? 14
                    : data.titleSize === "sm"
                      ? 16
                      : data.titleSize === "md"
                        ? 20
                        : data.titleSize === "lg"
                          ? 24
                          : 30,
              }}
            >
              {data.title}
            </Title>
          )}

          {data.subtitle && (
            <Text
              style={{
                color: data.subtitleColor || "#CCCCCC",
                fontSize:
                  data.subtitleSize === "xs"
                    ? 12
                    : data.subtitleSize === "sm"
                      ? 14
                      : data.subtitleSize === "md"
                        ? 16
                        : data.subtitleSize === "lg"
                          ? 18
                          : 20,
              }}
            >
              {data.subtitle}
            </Text>
          )}

          {data.compact ? (
            <Group gap="xs" wrap="nowrap" style={{ width: "100%" }}>
              <TextInput
                placeholder={data.placeholderText || "E-posta adresinizi girin"}
                leftSection={<IconMail size={16} />}
                style={{ flex: 1 }}
                readOnly
              />
              <Button
                style={{
                  backgroundColor:
                    data.buttonColor || "var(--mantine-color-blue-6)",
                  color: data.buttonTextColor || "#FFFFFF",
                }}
              >
                {data.buttonText || "Abone Ol"}
              </Button>
            </Group>
          ) : (
            <Stack gap="xs" style={{ width: "100%" }}>
              <TextInput
                placeholder={data.placeholderText || "E-posta adresinizi girin"}
                leftSection={<IconMail size={16} />}
                readOnly
              />
              <Button
                fullWidth
                style={{
                  backgroundColor:
                    data.buttonColor || "var(--mantine-color-blue-6)",
                  color: data.buttonTextColor || "#FFFFFF",
                }}
              >
                {data.buttonText || "Abone Ol"}
              </Button>
            </Stack>
          )}
        </Stack>
      </Box>

      <Box
        p="sm"
        style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}
      >
        <Group justify="space-between">
          <Group gap="xs">
            <IconMail size={16} />
            <Text size="sm" fw={500}>
              E-posta Aboneliği
            </Text>
          </Group>
          <Group gap="xs">
            <Text size="xs" c="dimmed">
              {data.compact ? "Kompakt" : "Standart"}
            </Text>
            <Text size="xs" c="dimmed">
              {data.alignment || "center"}
            </Text>
          </Group>
        </Group>
      </Box>
    </Card>
  );
};

export default ModernEmailSignup;
