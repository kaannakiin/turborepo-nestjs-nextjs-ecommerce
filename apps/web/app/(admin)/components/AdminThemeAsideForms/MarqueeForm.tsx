"use client";

import {
  Button,
  ColorInput,
  Group,
  NumberInput,
  Select,
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
import {
  getMantineFontWeightLabel,
  getMantineSizeLabel,
} from "../../../../lib/helpers";

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
        render={({ field }) => (
          <Select
            {...field}
            label="Yazı Boyutu"
            allowDeselect={false}
            data={Object.values(MantineSize).map((size) => ({
              value: size,
              label: getMantineSizeLabel(size),
            }))}
          />
        )}
      />
      <Controller
        control={control}
        name="fontWeight"
        render={({ field }) => (
          <Select
            {...field}
            label="Yazı Ağırlığı"
            allowDeselect={false}
            data={Object.values(MantineFontWeight).map((weight) => ({
              value: weight,
              label: getMantineFontWeightLabel(weight),
            }))}
          />
        )}
      />
      <Controller
        control={control}
        name="paddingY"
        render={({ field }) => (
          <Select
            {...field}
            allowDeselect={false}
            label="Y Ekseni boşluğu"
            data={Object.values(MantineSize).map((size) => ({
              value: size,
              label: getMantineSizeLabel(size),
            }))}
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
