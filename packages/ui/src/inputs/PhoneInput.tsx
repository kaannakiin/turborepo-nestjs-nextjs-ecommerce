"use client";
import {
  Combobox,
  Group,
  InputBase,
  Text,
  useCombobox,
  ScrollArea,
  Box,
  Image,
  AspectRatio,
  InputBaseProps,
} from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { useState, useMemo, forwardRef } from "react";
import { IMaskInput } from "react-imask";
import {
  PhoneNumberUtil,
  type RegionCode,
  PhoneNumberFormat,
} from "google-libphonenumber";

interface Country {
  code: RegionCode;
  dialCode: string;
  name: string;
  mask: string;
}

interface PhoneInputProps extends Omit<InputBaseProps, "onChange"> {
  onChange?: (value: string) => void;
  defaultCountry?: RegionCode;
  value?: string;
}

const phoneUtil = PhoneNumberUtil.getInstance();

const POPULAR_COUNTRIES = ["TR", "US", "GB", "DE", "FR", "NL", "IT", "ES"];

const getAllCountries = (): Country[] => {
  const regions = phoneUtil.getSupportedRegions();

  return regions
    .map((region: string) => {
      try {
        const countryCode = phoneUtil.getCountryCodeForRegion(region);
        const exampleNumber = phoneUtil.getExampleNumber(region);

        let mask = "";
        if (exampleNumber) {
          const formatted = phoneUtil.format(
            exampleNumber,
            PhoneNumberFormat.INTERNATIONAL,
          );

          mask = formatted.replace(/\d/g, "0");
        } else {
          mask = `+${String(countryCode).replace(/\d/g, "0")} 0000000000`;
        }

        return {
          code: region,
          dialCode: `+${countryCode}`,
          name:
            new Intl.DisplayNames(["tr"], { type: "region" }).of(region) ||
            region,
          mask,
        };
      } catch {
        return null;
      }
    })
    .filter((country): country is Country => country !== null)
    .sort((a: Country, b: Country) => a.name.localeCompare(b.name, "tr"));
};

const getFlagUrl = (countryCode: string) =>
  `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value = "", onChange, defaultCountry = "TR", ...props }, ref) => {
    const countries = useMemo(() => getAllCountries(), []);

    const { ref: rootRef, width } = useElementSize();

    const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
      return countries.find((c) => c.code === defaultCountry) || countries[0];
    });

    const combobox = useCombobox({
      onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const { popularCountries, otherCountries } = useMemo(() => {
      const popular: Country[] = [];
      const other: Country[] = [];

      countries.forEach((country: Country) => {
        if (POPULAR_COUNTRIES.includes(country.code)) {
          popular.push(country);
        } else {
          other.push(country);
        }
      });

      popular.sort(
        (a: Country, b: Country) =>
          POPULAR_COUNTRIES.indexOf(a.code) - POPULAR_COUNTRIES.indexOf(b.code),
      );

      return { popularCountries: popular, otherCountries: other };
    }, [countries]);

    const handleCountrySelect = (countryCode: string) => {
      const selected = countries.find((c) => c.code === countryCode);
      if (selected) {
        setSelectedCountry(selected);

        onChange?.(selected.dialCode);
      }
      combobox.closeDropdown();
    };

    const renderCountryOption = (country: Country) => (
      <Combobox.Option value={country.code} key={country.code}>
        <Group gap="xs">
          <AspectRatio ratio={3 / 4} maw={24} pos={"relative"}>
            <Image
              src={getFlagUrl(country.code)}
              alt={country.name.slice(0, 5)}
              style={{ objectFit: "contain" }}
            />
          </AspectRatio>
          <Text size="sm" fw={500}>
            {country.dialCode}
          </Text>
          <Text size="sm" c="dimmed">
            {country.name}
          </Text>
        </Group>
      </Combobox.Option>
    );

    const countrySelector = (
      <Combobox
        store={combobox}
        onOptionSubmit={handleCountrySelect}
        withinPortal={true}
        width={width - 15}
        position="bottom-start"
      >
        <Combobox.Target>
          <InputBase
            component="button"
            type="button"
            pointer
            onClick={() => combobox.toggleDropdown()}
            styles={{
              input: {
                border: "none",
                background: "transparent",
                width: 50,
              },
            }}
          >
            <Group gap={6} wrap="nowrap">
              <AspectRatio ratio={3 / 4} maw={24} pos={"relative"}>
                <Image
                  src={getFlagUrl(selectedCountry.code)}
                  alt={selectedCountry.name}
                  style={{ objectFit: "contain" }}
                />
              </AspectRatio>
            </Group>
          </InputBase>
        </Combobox.Target>

        <Combobox.Dropdown>
          <ScrollArea.Autosize mah={300} type="scroll">
            <Combobox.Options>
              {popularCountries.length > 0 && (
                <>
                  <Combobox.Group label="Popüler Ülkeler">
                    {popularCountries.map(renderCountryOption)}
                  </Combobox.Group>
                  <Combobox.Group label="Tüm Ülkeler">
                    {otherCountries.map(renderCountryOption)}
                  </Combobox.Group>
                </>
              )}
            </Combobox.Options>
          </ScrollArea.Autosize>
        </Combobox.Dropdown>
      </Combobox>
    );

    const displayValue = useMemo(() => {
      if (!value) return selectedCountry.dialCode;

      return value.startsWith("+") ? value : `+${value}`;
    }, [value, selectedCountry]);

    return (
      <Box ref={rootRef} w="100%">
        <InputBase
          ref={ref}
          component={IMaskInput}
          mask={selectedCountry.mask}
          leftSection={countrySelector}
          leftSectionWidth={60}
          leftSectionPointerEvents="all"
          value={displayValue}
          onAccept={(maskedValue: string) => {
            onChange?.(maskedValue);
          }}
          {...props}
        />
      </Box>
    );
  },
);

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
