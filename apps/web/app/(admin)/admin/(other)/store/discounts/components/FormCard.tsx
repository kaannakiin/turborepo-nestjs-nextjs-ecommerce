"use client";
import { Card, CardProps, Stack, Title } from "@mantine/core";

const FormCard = ({
  children,
  title,
  classNames,
}: {
  children: React.ReactNode;
  title: string | React.ReactNode;
  classNames?: CardProps["classNames"];
}) => {
  return (
    <Card withBorder radius={"md"} classNames={classNames}>
      <Card.Section className="border-b border-gray-400">
        {typeof title === "string" ? (
          <Title order={4} p={"md"}>
            {title}
          </Title>
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
