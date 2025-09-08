"use client";
import {
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Box,
  Transition,
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconChevronRight } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export interface AdminHoverCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  href: string;
  gradient?: string;
}

// Ayrı component olarak tanımlıyoruz
const AdminCard = ({ item }: { item: AdminHoverCardProps }) => {
  const { hovered, ref } = useHover();
  const { push } = useRouter();
  return (
    <Card
      ref={ref}
      withBorder
      p="xl"
      radius="lg"
      className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-var(--mantine-admin-color-9)"
      style={{
        background: hovered
          ? "linear-gradient(135deg, var(--mantine-admin-color-0) 0%, var(--mantine-admin-color-1) 100%)"
          : "white",
        borderColor: hovered
          ? "var(--mantine-admin-color-3)"
          : "var(--mantine-color-gray-3)",
        transform: hovered ? "translateY(-4px)" : "translateY(0px)",
      }}
      onClick={() => push(item.href)}
    >
      <Stack gap="md" h="100%">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap="md" align="center" wrap="nowrap" style={{ flex: 1 }}>
            <ThemeIcon
              variant="light"
              size="xl"
              radius="md"
              color="var(--mantine-color-admin-6)"
              style={{
                backgroundColor: hovered
                  ? "var(--mantine-color-admin-1)"
                  : "var(--mantine-color-admin-0)",
                color: hovered
                  ? "var(--mantine-color-admin-7)"
                  : "var(--mantine-color-admin-6)",
                transition: "all 300ms ease",
                transform: hovered ? "scale(1.1)" : "scale(1)",
              }}
            >
              {item.icon}
            </ThemeIcon>

            <Box style={{ flex: 1, minWidth: 0 }}>
              <Title
                order={4}
                style={{
                  color: hovered
                    ? "var(--mantine-color-admin-8)"
                    : "var(--mantine-color-dark-7)",
                  fontWeight: 600,
                  lineHeight: 1.3,
                }}
              >
                {item.title}
              </Title>
            </Box>
          </Group>

          <Transition mounted={hovered} transition="slide-left" duration={200}>
            {(styles) => (
              <ThemeIcon
                variant="transparent"
                size="sm"
                style={{
                  ...styles,
                  color: "var(--mantine-color-admin-6)",
                }}
              >
                <IconChevronRight size={16} />
              </ThemeIcon>
            )}
          </Transition>
        </Group>

        {/* Description */}
        {item.description && (
          <Text
            size="sm"
            style={{
              color: hovered
                ? "var(--mantine-color-admin-7)"
                : "var(--mantine-color-dimmed)",
              lineHeight: 1.5,
              marginTop: "auto",
            }}
          >
            {item.description}
          </Text>
        )}

        {/* Subtle bottom accent line */}
        <Box
          style={{
            height: 3,
            background: hovered
              ? "linear-gradient(90deg, var(--mantine-color-admin-4), var(--mantine-color-admin-6))"
              : "var(--mantine-color-gray-2)",
            borderRadius: 2,
            transition: "all 300ms ease",
            marginTop: "auto",
          }}
        />
      </Stack>
    </Card>
  );
};

const AdminHoverCard = ({ data }: { data: AdminHoverCardProps[] }) => {
  return (
    <SimpleGrid cols={{ xs: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
      {data.map((item, index) => (
        <AdminCard key={index} item={item} />
      ))}
    </SimpleGrid>
  );
};

export default AdminHoverCard;
