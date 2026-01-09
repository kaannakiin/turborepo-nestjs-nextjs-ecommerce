'use client';

import { Avatar, Badge, ColorSwatch, Select, Tooltip } from '@mantine/core';
import {
  VariantGroupRenderType,
  VariantGroupType,
} from '@repo/database/client';
import { ProductDetailVariantGroup } from '@repo/types';

interface VariantSelectorProps {
  variantGroups: ProductDetailVariantGroup[];
  selectedSlugs: Record<string, string>;
  onSelectOption: (groupSlug: string, optionSlug: string) => void;
  isOptionSelected: (groupSlug: string, optionSlug: string) => boolean;
  isOptionSelectable: (groupId: string, optionId: string) => boolean;
}

const VariantSelector = ({
  variantGroups,
  selectedSlugs,
  onSelectOption,
  isOptionSelected,
  isOptionSelectable,
}: VariantSelectorProps) => {
  return (
    <div className="flex flex-col gap-6 mt-4">
      {variantGroups.map((group) => {
        const groupSlug = group.variantGroup.translations[0]?.slug;
        const groupName = group.variantGroup.translations[0]?.name;
        const groupType = group.variantGroup.type;
        const renderType = group.renderVisibleType;

        if (!groupSlug || !groupName) return null;

        if (renderType === VariantGroupRenderType.DROPDOWN) {
          const selectData = group.options
            .map((option) => {
              const optionSlug = option.variantOption.translations[0]?.slug;
              const optionName = option.variantOption.translations[0]?.name;
              const optionId = option.variantOption.id;
              const selectable = isOptionSelectable(
                group.variantGroup.id,
                optionId,
              );

              if (!optionSlug || !optionName) return null;

              return {
                value: optionSlug,
                label: optionName,
                disabled: !selectable,
              };
            })
            .filter(Boolean) as {
            value: string;
            label: string;
            disabled: boolean;
          }[];

          return (
            <div key={group.id} className="flex flex-col gap-2">
              <span className="font-medium">{groupName}</span>
              <Select
                data={selectData}
                value={selectedSlugs[groupSlug] || null}
                onChange={(value) => {
                  if (value) onSelectOption(groupSlug, value);
                }}
                placeholder={`${groupName} seçin`}
                allowDeselect={false}
                classNames={{
                  input: 'border-gray-300 focus:border-black',
                }}
              />
            </div>
          );
        }

        return (
          <div key={group.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{groupName}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {group.options.map((option) => {
                const optionSlug = option.variantOption.translations[0]?.slug;
                const optionName = option.variantOption.translations[0]?.name;
                const optionId = option.variantOption.id;

                if (!optionSlug || !optionName) return null;

                const isSelected = isOptionSelected(groupSlug, optionSlug);
                const selectable = isOptionSelectable(
                  group.variantGroup.id,
                  optionId,
                );

                if (groupType === VariantGroupType.COLOR) {
                  const hexValue = option.variantOption.hexValue;
                  const assetUrl = option.variantOption.asset?.url;

                  return (
                    <Tooltip key={option.id} label={optionName}>
                      <button
                        onClick={() => onSelectOption(groupSlug, optionSlug)}
                        disabled={!selectable}
                        className={`
                        relative transition-all
                        ${isSelected ? 'ring-2 ring-black ring-offset-2 rounded-full' : ''}
                        ${!selectable ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-80'}
                      `}
                      >
                        {assetUrl ? (
                          <Avatar
                            src={assetUrl}
                            alt={optionName}
                            size="lg"
                            radius="xl"
                            className={`
                            border-2 
                            ${isSelected ? 'border-black' : 'border-gray-200'}
                          `}
                          />
                        ) : hexValue ? (
                          <ColorSwatch
                            color={hexValue}
                            className="size-[2rem]"
                          />
                        ) : (
                          <Avatar
                            size="lg"
                            radius="xl"
                            className={`
                            border-2 bg-gray-200
                            ${isSelected ? 'border-black' : 'border-gray-200'}
                          `}
                          >
                            {optionName.charAt(0)}
                          </Avatar>
                        )}

                        {!selectable && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-0.5 bg-gray-500 rotate-45" />
                          </div>
                        )}
                      </button>
                    </Tooltip>
                  );
                }

                return (
                  <Badge
                    key={option.id}
                    component="button"
                    onClick={() => onSelectOption(groupSlug, optionSlug)}
                    disabled={!selectable}
                    size="xl"
                    radius="md"
                    variant={isSelected ? 'filled' : 'outline'}
                    color={isSelected ? 'dark' : 'gray'}
                    className={`
                      cursor-pointer transition-all px-4 py-2 h-auto
                      ${!selectable ? 'opacity-30 cursor-not-allowed line-through' : 'hover:border-black'}
                    `}
                    styles={{
                      root: {
                        textTransform: 'none',
                        fontWeight: 500,
                      },
                    }}
                  >
                    {optionName}
                  </Badge>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VariantSelector;
