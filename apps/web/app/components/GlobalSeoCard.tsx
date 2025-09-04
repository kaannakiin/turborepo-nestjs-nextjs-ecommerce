/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import {
  Card,
  Group,
  InputLabel,
  SimpleGrid,
  Text,
  Textarea,
  TextareaProps,
  TextInput,
  TextInputProps,
  Title,
} from "@mantine/core";
import { Control, Controller, FieldPath, useWatch } from "@repo/shared";

interface SlugProps extends Omit<TextInputProps, "value" | "onChange"> {}
interface MetaTitleProps extends Omit<TextInputProps, "value" | "onChange"> {}
interface MetaDescriptionProps
  extends Omit<TextareaProps, "value" | "onChange"> {}

interface SeoCardProps<T extends Record<string, any>> {
  control: Control<T>;
  slugFieldName?: FieldPath<T>;
  metaTitleFieldName: FieldPath<T>;
  metaDescriptionFieldName: FieldPath<T>;
  slugProps?: SlugProps;
  metaTitleProps?: MetaTitleProps;
  metaDescriptionProps?: MetaDescriptionProps;
}

const GlobalSeoCard = <T extends Record<string, any>>({
  control,
  slugFieldName,
  metaTitleFieldName,
  metaDescriptionFieldName,
  slugProps = {},
  metaTitleProps = {},
  metaDescriptionProps = {},
}: SeoCardProps<T>) => {
  const slug =
    slugFieldName &&
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useWatch({
      control,
      name: slugFieldName,
    });

  const metaTitle = useWatch({
    control,
    name: metaTitleFieldName,
  });

  const metaDescription = useWatch({
    control,
    name: metaDescriptionFieldName,
  });

  return (
    <Card px={0} className="gap-3">
      <Title order={4}>Arama Motoru Optimizasyonu (SEO)</Title>

      <SimpleGrid
        cols={{
          xs: 1,
          md: 2,
        }}
        className="gap-0"
      >
        <div className="bg-gray-50 p-6 border-r border-gray-200">
          <div className="flex flex-col gap-4">
            {slugFieldName && (
              <Controller
                control={control}
                name={slugFieldName}
                render={({ field, fieldState }) => (
                  <div>
                    <TextInput
                      {...slugProps}
                      label="Slug"
                      leftSection={<span className="font-bold">/</span>}
                      leftSectionProps={{
                        className: "text-black bg-gray-100",
                      }}
                      classNames={{
                        input: "!pl-10",
                      }}
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={fieldState.error?.message}
                    />
                    <Group justify="flex-end">
                      <Text fz={"xs"} c={"dimmed"}>
                        {field.value ? field.value.length : 0}/256
                      </Text>
                    </Group>
                  </div>
                )}
              />
            )}

            <Controller
              control={control}
              name={metaTitleFieldName}
              render={({ field, fieldState }) => (
                <div>
                  <TextInput
                    {...metaTitleProps}
                    label="Meta Başlığı"
                    value={field.value || ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                  />
                  <Group justify="flex-end">
                    <Text fz={"xs"} c={"dimmed"}>
                      {field.value ? field.value.length : 0}/256
                    </Text>
                  </Group>
                </div>
              )}
            />

            <Controller
              control={control}
              name={metaDescriptionFieldName}
              render={({ field, fieldState }) => (
                <div>
                  <Textarea
                    {...metaDescriptionProps}
                    label="Meta Açıklama"
                    autosize
                    minRows={2}
                    maxRows={4}
                    value={field.value || ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                  />
                  <Group justify="flex-end">
                    <Text fz={"xs"} c={"dimmed"}>
                      {field.value ? field.value.length : 0}/512
                    </Text>
                  </Group>
                </div>
              )}
            />
          </div>
        </div>

        <div className="bg-[var(--mantine-primary-color-0)] p-6">
          <div className="flex flex-col gap-1">
            <InputLabel>Arama Önizlemesi</InputLabel>
            <Card withBorder shadow="0" p="md" className="bg-white">
              <div className="flex flex-col gap-1">
                {slugFieldName && (
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-gray-600">https://example.com/</span>
                    <span className="text-blue-600 font-medium">
                      {slug || "url-slug"}
                    </span>
                  </div>
                )}

                <div className="text-blue-600 hover:underline cursor-pointer text-xl font-medium mb-1">
                  {metaTitle || "Sayfa Başlığı Buraya Gelecek"}
                </div>

                <div className="text-gray-700 text-sm leading-relaxed">
                  {metaDescription ||
                    "Bu açıklama Google arama sonuçlarında görünecek kısa açıklamadır."}
                </div>

                <div className="text-gray-500 text-xs mt-1">
                  {new Date().toLocaleDateString("tr-TR")}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </SimpleGrid>
    </Card>
  );
};

export default GlobalSeoCard;
