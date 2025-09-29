"use client";

import {
  Button,
  ColorInput,
  Group,
  NumberInput,
  SimpleGrid,
  Stack,
  Switch,
  TextInput,
} from "@mantine/core";
import {
  Controller,
  createId,
  SubmitHandler,
  useForm,
  zodResolver,
} from "@repo/shared";
import {
  MantineFontWeight,
  MantineSize,
  MarqueeSchema,
  MarqueeType,
} from "@repo/types";
import FontSizeSelect from "./CustomSelects/FontSizeSelect";
import FontWeightSelect from "./CustomSelects/FontWeightSelect";

interface MarqueeFormProps {
  defaultValues?: MarqueeType;
  onSubmit: SubmitHandler<MarqueeType>;
}

const MarqueeForm = ({ defaultValues, onSubmit }: MarqueeFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<MarqueeType>({
    resolver: zodResolver(MarqueeSchema),
    defaultValues: defaultValues || {
      uniqueId: createId(),
      backgroundColor: "#000000",
      duration: 10,
      fontWeight: MantineFontWeight.normal,
      fontSize: MantineSize.md,
      paddingY: MantineSize.md,
      pauseOnHover: true,
      text: "",
      textColor: "#ffffff",
      repeat: 20,
      reverse: false,
    },
  });

  return (
    <Stack gap={"lg"}>
      <Controller
        control={control}
        name="text"
        render={({ field }) => <TextInput {...field} label="Yazı" />}
      />
      <Controller
        control={control}
        name="backgroundColor"
        render={({ field: { onChange, ...field } }) => (
          <ColorInput
            onChangeEnd={onChange}
            {...field}
            label="Arka Plan Rengi"
          />
        )}
      />
      <Controller
        control={control}
        name="textColor"
        render={({ field: { onChange, ...field } }) => (
          <ColorInput onChangeEnd={onChange} {...field} label="Yazı Rengi" />
        )}
      />
      <Controller
        control={control}
        name="repeat"
        render={({ field }) => (
          <NumberInput
            {...field}
            hideControls
            min={10}
            max={50}
            label="Tekrar Sayısı"
          />
        )}
      />
      <Controller
        control={control}
        name="duration"
        render={({ field }) => (
          <NumberInput
            {...field}
            label="Süre"
            min={0.1}
            max={60}
            decimalScale={1}
            fixedDecimalScale
          />
        )}
      />
      <Controller
        control={control}
        name="fontSize"
        render={({ field, fieldState }) => (
          <FontSizeSelect {...field} error={fieldState.error?.message} />
        )}
      />
      <Controller
        control={control}
        name="fontWeight"
        render={({ field, fieldState }) => (
          <FontWeightSelect {...field} error={fieldState.error?.message} />
        )}
      />
      <Controller
        control={control}
        name="paddingY"
        render={({ field, fieldState }) => (
          <FontSizeSelect
            {...field}
            label="Dikey Padding"
            error={fieldState.error?.message}
          />
        )}
      />
      <SimpleGrid cols={2}>
        <Controller
          control={control}
          name="pauseOnHover"
          render={({ field: { value, ...field } }) => (
            <Switch checked={value} {...field} label="Üzerine Gelince Durdur" />
          )}
        />
        <Controller
          control={control}
          name="reverse"
          render={({ field: { value, ...field } }) => (
            <Switch checked={value} {...field} label="Tersine Çevir" />
          )}
        />
      </SimpleGrid>
      <Group justify="end">
        <Button
          variant="outline"
          type="button"
          onClick={handleSubmit(onSubmit)}
        >
          {defaultValues ? "Güncelle" : "Ekle"}
        </Button>
      </Group>
    </Stack>
  );
};

export default MarqueeForm;
