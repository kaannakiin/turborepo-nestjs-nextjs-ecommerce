/* eslint-disable react/no-unescaped-entities */
"use client";

import fetchWrapper from "@lib/fetchWrapper";
import {
  Combobox,
  InputBase,
  InputBaseProps,
  useCombobox,
} from "@mantine/core";
import { $Enums } from "@repo/database/client";
import {
  createId,
  slugify,
  UseFormReset,
  UseFormSetValue,
  useQuery,
} from "@repo/shared";
import { VariantGroupZodType } from "@repo/types";
import { useMemo, useState } from "react";

interface CreatableSelectProps extends Omit<InputBaseProps, "rightSection"> {
  setValue: UseFormSetValue<VariantGroupZodType>;
  value?: string;
  onChange: (value: string) => void;
  reset: UseFormReset<VariantGroupZodType>;
}

const CreatableSelect = ({
  reset,
  setValue,
  onChange,
  value,
  ...props
}: CreatableSelectProps) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [search, setSearch] = useState(value || "");

  const { data: allVariants, isLoading } = useQuery({
    queryKey: ["variants"],
    queryFn: async (): Promise<VariantGroupZodType[]> => {
      const response = await fetchWrapper.get<VariantGroupZodType[]>(
        `/admin/products/get-variants`
      );

      if (!response.success) {
        throw new Error("Failed to fetch variants");
      }

      return response.data;
    },
  });

  const existingNames = useMemo(() => {
    if (!allVariants) return new Set<string>();

    return new Set(
      allVariants.flatMap((variant) =>
        variant.translations
          .map((t) => (t.name || "").toLowerCase().trim())
          .filter((name) => name.length > 0)
      )
    );
  }, [allVariants]);

  // Search query'e göre filtreleme yap
  const filteredVariants = useMemo(() => {
    if (!allVariants || !search.trim()) return [];

    return allVariants.filter((item) => {
      const trTranslation = item.translations.find((t) => t.locale === "TR");
      const name = trTranslation?.name || item.translations[0]?.name || "";
      return name.toLowerCase().includes(search.toLowerCase());
    });
  }, [allVariants, search]);

  // Exact match kontrolü (case-insensitive)
  const exactMatch = useMemo(() => {
    if (!allVariants || !search.trim()) return null;

    return allVariants.find((item) => {
      const trTranslation = item.translations.find((t) => t.locale === "TR");
      const name = trTranslation?.name || item.translations[0]?.name || "";
      return name.toLowerCase() === search.toLowerCase().trim();
    });
  }, [allVariants, search]);

  // Case-insensitive duplicate kontrolü - exactMatch varsa duplicate sayma
  const isDuplicate = useMemo(() => {
    const searchTrimmed = search.trim();
    if (!searchTrimmed || exactMatch) return false;

    return existingNames.has(searchTrimmed.toLowerCase());
  }, [existingNames, search, exactMatch]);

  // Dropdown seçenekleri
  const options = filteredVariants.map((item) => {
    const trTranslation = item.translations.find((t) => t.locale === "TR");
    const displayName =
      trTranslation?.name || item.translations[0]?.name || "İsimsiz";

    return (
      <Combobox.Option value={item.uniqueId} key={item.uniqueId}>
        {displayName} ({item.type === "COLOR" ? "Renk" : "Liste"})
      </Combobox.Option>
    );
  });

  const handleSelectExisting = (selectedId: string) => {
    const selectedItem = allVariants?.find(
      (item) => item.uniqueId === selectedId
    );
    if (selectedItem) {
      reset({
        uniqueId: selectedItem.uniqueId,
        type: selectedItem.type,
        translations: selectedItem.translations,
        options: selectedItem.options,
      });

      const trTranslation = selectedItem.translations.find(
        (t) => t.locale === "TR"
      );
      const displayName =
        trTranslation?.name || selectedItem.translations[0]?.name || "";
      setSearch(displayName);
      onChange(displayName);
    }
  };

  const handleCreateNew = () => {
    const searchTrimmed = search.trim();

    // Boş isim kontrolü
    if (!searchTrimmed) {
      alert("Variant grup adı boş olamaz.");
      return;
    }

    // Case-insensitive duplicate kontrolü
    if (isDuplicate) {
      // Case farklı ama aynı isim
      const existingVariant = allVariants?.find((variant) => {
        const trTranslation = variant.translations.find(
          (t) => t.locale === "TR"
        );
        const name = trTranslation?.name || variant.translations[0]?.name || "";
        return name.toLowerCase() === searchTrimmed.toLowerCase();
      });

      if (existingVariant) {
        const trTranslation = existingVariant.translations.find(
          (t) => t.locale === "TR"
        );
        const existingName =
          trTranslation?.name || existingVariant.translations[0]?.name || "";
        alert(
          `"${existingName}" isimli variant zaten mevcut. Lütfen mevcut kaydı seçin veya farklı bir isim kullanın.`
        );
      }
      return;
    }

    // Yeni variant group oluştur
    reset({
      type: "LIST" as $Enums.VariantGroupType,
      uniqueId: createId(),
      options: [],
      translations: [
        {
          locale: "TR" as $Enums.Locale,
          name: searchTrimmed,
          slug: slugify(searchTrimmed),
        },
      ],
    });
  };

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={(val) => {
        if (val === "$create") {
          handleCreateNew();
        } else {
          handleSelectExisting(val);
        }
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          rightSection={<Combobox.Chevron />}
          {...props}
          value={search}
          onChange={(event) => {
            const newValue = event.currentTarget.value;
            setSearch(newValue);
            combobox.openDropdown();
            combobox.updateSelectedOptionIndex();
            onChange?.(newValue);

            // Form'u real-time güncelle sadece yeni oluşturma için
            const trimmedValue = newValue.trim();
            if (trimmedValue && !exactMatch) {
              setValue("translations.0.name", trimmedValue);
              setValue("translations.0.slug", slugify(trimmedValue));
            }
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => {
            combobox.closeDropdown();
          }}
          placeholder="Variant grup adı ara veya oluştur"
          rightSectionPointerEvents="none"
          error={
            isDuplicate && search.trim()
              ? "Bu isimde bir variant zaten mevcut"
              : undefined
          }
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          {isLoading && (
            <Combobox.Option value="" disabled>
              Yükleniyor...
            </Combobox.Option>
          )}

          {!isLoading && options.length > 0 && options}

          {!isLoading && search.trim().length === 0 && (
            <Combobox.Option value="" disabled>
              Aramak için yazmaya başlayın
            </Combobox.Option>
          )}

          {!isLoading &&
            search.trim().length > 0 &&
            !exactMatch &&
            !isDuplicate && (
              <Combobox.Option value="$create">
                + "{search.trim()}" oluştur
              </Combobox.Option>
            )}

          {!isLoading &&
            search.trim().length > 0 &&
            options.length === 0 &&
            isDuplicate && (
              <Combobox.Option value="" disabled>
                Bu isimde variant zaten mevcut
              </Combobox.Option>
            )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

export default CreatableSelect;
