"use client";
import { fontSelectData } from "@lib/helpers";
import {
  CheckIcon,
  ColorInput,
  Group,
  NumberInput,
  Select,
  Text,
} from "@mantine/core";
import { Control, Controller } from "@repo/shared";
import { ThemeInputType } from "@repo/types";
import { IconTypography } from "@tabler/icons-react";

interface ThemeSettingsComponentProps {
  control: Control<ThemeInputType>;
}

const ThemeSettingsComponent = ({ control }: ThemeSettingsComponentProps) => {
  const prefix = `settings` as const;

  return (
    <>
      <Controller
        control={control}
        name={`${prefix}.primaryColor`}
        render={({ field: { onChange, ...field } }) => (
          <ColorInput
            {...field}
            label="Ana Renk"
            onChangeEnd={onChange}
            format="hex"
            size="sm"
          />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.secondaryColor`}
        render={({ field: { onChange, ...field } }) => (
          <ColorInput
            {...field}
            label="İkincil Renk"
            onChangeEnd={onChange}
            format="hex"
            size="sm"
          />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.primaryShade`}
        render={({ field, fieldState }) => (
          <NumberInput
            label="Primary Shade"
            min={0}
            max={9}
            allowDecimal={false}
            {...field}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.font`}
        render={({ field, fieldState }) => (
          <Select
            {...field}
            label="Yazı Tipi (Font)"
            placeholder="Font seçiniz..."
            data={fontSelectData} // Gruplanmış data
            searchable // Yazarak arama özelliği
            maxDropdownHeight={300}
            leftSection={<IconTypography size={16} />}
            error={fieldState.error?.message}
            allowDeselect={false}
            // ÖNEMLİ KISIM: Seçeneği özelleştirme
            renderOption={({ option, checked }) => {
              // Option bir grup başlığı değilse render et
              return (
                <Group flex="1" gap="xs" wrap="nowrap">
                  {/* Font önizlemesi */}
                  <Text
                    size="md" // Biraz büyük olsun ki font belli olsun
                    style={{ fontFamily: option.value }} // ✨ SİHİR BURADA
                  >
                    {option.label}
                  </Text>

                  {/* Seçiliyse tik işareti (Opsiyonel ama şık durur) */}
                  {checked && (
                    <CheckIcon size={12} style={{ marginLeft: "auto" }} />
                  )}
                </Group>
              );
            }}
            // Seçili olan inputta nasıl gözüksün?
            // İstersen input içindeki yazı da o fontta olsun:
            styles={{
              input: {
                fontFamily: field.value ? field.value : "inherit",
              },
            }}
          />
        )}
      />
    </>
  );
};

export default ThemeSettingsComponent;
