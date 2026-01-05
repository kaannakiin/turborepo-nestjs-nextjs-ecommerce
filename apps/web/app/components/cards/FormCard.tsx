"use client";
import { Card, CardProps, Group, Stack, Title } from "@mantine/core";

const FormCard = ({
  children,
  title,
  classNames,
  icon,
}: {
  children: React.ReactNode;
  title: string | React.ReactNode;
  classNames?: CardProps["classNames"];
  icon?: React.ReactNode;
}) => {
  return (
    <Card withBorder radius={"md"} classNames={classNames}>
      <Card.Section className="border-b border-gray-400">
        {typeof title === "string" ? (
          <Group gap={"md"} p={"md"}>
            {icon}
            <Title order={4}>{title}</Title>
          </Group>
        ) : (
          title
        )}
      </Card.Section>
      <Stack gap={"md"} py={"md"}>
        {children}
      </Stack>
    </Card>
  );
};
export default FormCard;
