"use client";
import FormCard from "@/(admin)/components/FormCard";
import {
  Alert,
  Group,
  Radio,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { Controller, Form, useForm, zodResolver } from "@repo/shared";
import {
  CampaignOfferType,
  CampaignZodSchema,
  CampaignZodType,
} from "@repo/types";
import {
  IconCaretUpFilled,
  IconInfoCircle,
  IconRouteX,
} from "@tabler/icons-react";
import SearchableProductModal from "./SearchableProductModal";

interface CampaignFormProps {
  defaultValues?: CampaignZodType;
}

const CampaignForm = ({ defaultValues }: CampaignFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    watch,
  } = useForm<CampaignZodType>({
    resolver: zodResolver(CampaignZodSchema),
    defaultValues: defaultValues || {
      type: CampaignOfferType.UP_SELLING,
      currencies: ["TRY"],
      dates: {
        addEndDate: false,
        addStartDate: false,
      },
      translations: [{ locale: "TR", title: "" }],
    },
  });

  const type = watch("type");

  return (
    <Stack gap={"md"} className="max-w-5xl w-full lg:mx-auto ">
      <FormCard title="Başlık">
        <Controller
          control={control}
          name="translations.0.title"
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              error={fieldState.error?.message}
              label="Kampanya Başlığı"
              withAsterisk
            />
          )}
        />
      </FormCard>
      <FormCard title="İndirim Kurgusu">
        <Stack gap="md">
          <Controller
            control={control}
            name="type"
            render={({ field, fieldState }) => (
              <>
                <Radio.Group
                  {...field}
                  onChange={(e) => {
                    field.onChange(e as CampaignOfferType);
                  }}
                  error={fieldState.error?.message}
                >
                  <SimpleGrid cols={2}>
                    <Radio.Card
                      value={CampaignOfferType.UP_SELLING}
                      className={`border p-4 rounded-xl ${
                        field.value === CampaignOfferType.UP_SELLING
                          ? "border-2 border-[var(--mantine-primary-color-5)] bg-[var(--mantine-primary-color-light)]"
                          : "border border-gray-400 bg-white"
                      }`}
                    >
                      <Group justify="space-between" align="center">
                        <Group gap={"md"}>
                          <ThemeIcon
                            variant={
                              field.value === CampaignOfferType.UP_SELLING
                                ? "light"
                                : "transparent"
                            }
                            size={"lg"}
                          >
                            <IconCaretUpFilled />
                          </ThemeIcon>
                          <Text fz={"md"}>Up Sell</Text>
                        </Group>
                        <Radio.Indicator />
                      </Group>
                    </Radio.Card>

                    <Radio.Card
                      value={CampaignOfferType.CROSS_SELLING}
                      className={`border p-4 rounded-xl ${
                        field.value === CampaignOfferType.CROSS_SELLING
                          ? "border-2 border-[var(--mantine-primary-color-5)] bg-[var(--mantine-primary-color-light)]"
                          : "border border-gray-400 bg-white"
                      }`}
                    >
                      <Group justify="space-between" align="center">
                        <Group gap={"md"}>
                          <ThemeIcon
                            variant={
                              field.value === CampaignOfferType.CROSS_SELLING
                                ? "light"
                                : "transparent"
                            }
                            size={"lg"}
                          >
                            <IconRouteX />
                          </ThemeIcon>
                          <Text fz={"md"}>Cross Sell</Text>
                        </Group>
                        <Radio.Indicator />
                      </Group>
                    </Radio.Card>
                  </SimpleGrid>
                </Radio.Group>

                {field.value === CampaignOfferType.UP_SELLING && (
                  <Alert
                    icon={<IconInfoCircle size={16} />}
                    title="Up Sell Kampanyası"
                    color="blue"
                  >
                    Bu kampanya sadece ödeme sayfasında (checkout) görünecektir.
                  </Alert>
                )}

                {field.value === CampaignOfferType.CROSS_SELLING && (
                  <Alert
                    icon={<IconInfoCircle size={16} />}
                    title="Cross Sell Kampanyası"
                    color="blue"
                  >
                    Bu kampanya ödeme sayfası, ödeme sonrası ve ürün
                    sayfalarında gösterebilirsiniz.
                  </Alert>
                )}
              </>
            )}
          />
        </Stack>
      </FormCard>
      {type === CampaignOfferType.UP_SELLING && (
        <FormCard title="Satın Alınması Gereken Ürünler">
          <SearchableProductModal opened={true} onClose={() => {}} />
        </FormCard>
      )}
    </Stack>
  );
};

export default CampaignForm;
