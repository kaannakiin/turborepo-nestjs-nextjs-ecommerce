"use client";

import { Card, CardProps, Divider, Title } from "@mantine/core";

interface FormCardProps {
  title: string | React.ReactNode;
  children: React.ReactNode;
  classNames?: CardProps["classNames"];
}
const FormCard = ({ children, title, classNames }: FormCardProps) => {
  return (
    <Card withBorder classNames={classNames}>
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
