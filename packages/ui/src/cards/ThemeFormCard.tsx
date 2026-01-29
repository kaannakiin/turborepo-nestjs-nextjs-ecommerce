import { Card, Text } from "@mantine/core";
import { ReactNode } from "react";

interface ThemeFormCardProps {
  title: string;
  children: ReactNode;
}

const ThemeFormCard = ({ title, children }: ThemeFormCardProps) => {
  return (
    <Card withBorder pt="lg" style={{ overflow: "visible" }}>
      <Text
        size="sm"
        fw={500}
        style={{
          position: "absolute",
          top: -10,
          left: 12,
          backgroundColor: "var(--mantine-color-body)",
          paddingInline: 4,
          zIndex: 1,
        }}
      >
        {title}
      </Text>
      {children}
    </Card>
  );
};

export default ThemeFormCard;
