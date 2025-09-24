"use client";
import {
  Combobox,
  Group,
  InputBase,
  InputBaseProps,
  ScrollArea,
  Text,
  useCombobox,
} from "@mantine/core";
import { useState } from "react";
import {
  CountryIso2,
  defaultCountries,
  FlagImage,
  parseCountry,
  usePhoneInput,
} from "react-international-phone";

interface CustomPhoneInputProps
  extends Pick<InputBaseProps, "radius" | "size" | "styles"> {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  label?: string;
}

const CustomPhoneInput = ({
  onChange,
  value,
  onBlur,
  placeholder,
  error,
  radius = "md",
  size = "md",
  styles = {
    label: {
      fontWeight: 600,
      marginBottom: "8px",
      color: "#191414",
    },
  },
  label,
}: CustomPhoneInputProps) => {
  const [searchValue, setSearchValue] = useState("");
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const { inputValue, handlePhoneValueChange, inputRef, country, setCountry } =
    usePhoneInput({
      defaultCountry: "tr",
      value,
      countries: defaultCountries,
      onChange: (data) => {
        onChange(data.phone);
      },
    });

  const selectedCountry = defaultCountries.find((item) => {
    const parsedCountry = parseCountry(item);
    return parsedCountry.iso2 === country.iso2;
  });

  const filteredCountries = defaultCountries.filter((country) => {
    const parsedCountry = parseCountry(country);
    const searchLower = searchValue.toLowerCase();

    return (
      parsedCountry.name.toLowerCase().includes(searchLower) ||
      parsedCountry.dialCode.includes(searchLower) ||
      parsedCountry.iso2.toLowerCase().includes(searchLower)
    );
  });

  return (
    <InputBase
      onBlur={onBlur}
      error={error}
      label={label}
      placeholder={placeholder}
      radius={radius}
      styles={styles}
      size={size}
      leftSection={
        <Combobox
          store={combobox}
          withinPortal={true}
          onOptionSubmit={(value) => {
            setCountry(value as CountryIso2);
            combobox.closeDropdown();
          }}
        >
          <Combobox.Target>
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: "0 8px",
                marginRight: "8px",
                borderRight: "1px solid var(--mantine-color-gray-3)",
                backgroundColor: "transparent",
              }}
              onClick={() => {
                combobox.toggleDropdown();
              }}
            >
              {selectedCountry && (
                <FlagImage
                  iso2={parseCountry(selectedCountry).iso2}
                  style={{
                    width: "24px",
                    height: "16px",
                    objectFit: "cover",
                  }}
                />
              )}
            </div>
          </Combobox.Target>

          <Combobox.Dropdown
            style={{
              zIndex: 1000,
              // ✅ Width düzeltmeleri
              width: "300px", // Sabit genişlik ver
              minWidth: "300px", // Minimum genişlik
              maxWidth: "400px", // Maximum genişlik
            }}
          >
            <Combobox.Search
              placeholder="Bölge Ara"
              value={searchValue}
              onChange={(value) => {
                setSearchValue(value.currentTarget.value.trim());
              }}
              // ✅ Search input'un width'ini düzelt
              style={{
                width: "100%",
              }}
            />
            <ScrollArea.Autosize
              mah={200}
              style={{
                // ✅ ScrollArea width düzeltmesi
                width: "100%",
              }}
            >
              <Combobox.Options>
                {filteredCountries.map((country) => {
                  const parsedCountry = parseCountry(country);
                  return (
                    <Combobox.Option
                      key={parsedCountry.iso2}
                      value={parsedCountry.iso2}
                      style={{
                        // ✅ Option width'ini düzelt
                        width: "100%",
                        whiteSpace: "nowrap", // Tek satırda tut
                        overflow: "hidden",
                        textOverflow: "ellipsis", // Uzun metinleri kes
                      }}
                    >
                      <Group gap="xs" align="center" wrap="nowrap">
                        <div
                          style={{
                            width: 24,
                            height: 16,
                            flexShrink: 0, // Flag'in küçülmesini engelle
                          }}
                        >
                          <FlagImage
                            iso2={parsedCountry.iso2}
                            style={{
                              width: "24px",
                              height: "16px",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                        <Text
                          fz="sm"
                          style={{
                            // ✅ Text width düzeltmesi
                            flex: 1,
                            minWidth: 0, // Text'in küçülmesine izin ver
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          (+{parsedCountry.dialCode}) {parsedCountry.name}
                        </Text>
                      </Group>
                    </Combobox.Option>
                  );
                })}
              </Combobox.Options>
            </ScrollArea.Autosize>
          </Combobox.Dropdown>
        </Combobox>
      }
      leftSectionWidth={48}
      ref={inputRef}
      value={inputValue}
      onChange={handlePhoneValueChange}
      type="tel"
    />
  );
};
export default CustomPhoneInput;
