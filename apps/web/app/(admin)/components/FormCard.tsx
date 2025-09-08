"use client";

import { Card, Divider, Title } from "@mantine/core";

interface FormCardProps {
  title: string | React.ReactNode;
  children: React.ReactNode;
}
const FormCard = ({ children, title }: FormCardProps) => {
  return (
    <Card withBorder>
      <Card.Section>
        <Title p={"md"} order={4}>
          {title}
        </Title>
        <Divider mb={"md"} />
      </Card.Section>
      {children}
    </Card>
  );
};

export default FormCard;
