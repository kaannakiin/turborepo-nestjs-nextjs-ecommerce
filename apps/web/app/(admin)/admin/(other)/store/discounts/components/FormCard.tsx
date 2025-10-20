import { Card, Stack, Title } from "@mantine/core";

const FormCard = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string | React.ReactNode;
}) => {
  return (
    <Card withBorder radius={"md"}>
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
