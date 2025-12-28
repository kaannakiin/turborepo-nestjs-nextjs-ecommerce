"use client";

import { ColorSwatch, Group, Tooltip, Box, Avatar } from "@mantine/core";
import { PageFilterVariantGroupType } from "@repo/types";
import { IconCheck } from "@tabler/icons-react";

interface ColorSwatchRendererProps {
  options: PageFilterVariantGroupType["options"];
  groupSlug: string;
  selectedOptions: string[];
  onToggle: (groupSlug: string, optionSlug: string, checked: boolean) => void;
  showImages?: boolean;
}

const ColorSwatchRenderer = ({
  options,
  groupSlug,
  selectedOptions,
  onToggle,
  showImages = false,
}: ColorSwatchRendererProps) => {
  return (
    <Group gap="xs">
      {options.map((option) => {
        const optionSlug = option.translations[0]?.slug;
        const optionName = option.translations[0]?.name;
        const isSelected = selectedOptions.includes(optionSlug);

        if (!optionSlug) return null;

        if (showImages && option.asset) {
          return (
            <Tooltip key={option.id} label={optionName} withArrow>
              <Box
                style={{
                  position: "relative",
                  cursor: "pointer",
                  border: isSelected
                    ? "2px solid var(--mantine-color-blue-6)"
                    : "1px solid var(--mantine-color-gray-4)",
                  borderRadius: "50%",
                  padding: 2,
                }}
                onClick={() => onToggle(groupSlug, optionSlug, !isSelected)}
              >
                <Avatar
                  src={option.asset.url}
                  alt={optionName}
                  size={32}
                  radius="xl"
                />
                {isSelected && (
                  <Box
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      borderRadius: "50%",
                      padding: 4,
                      pointerEvents: "none",
                    }}
                  >
                    <IconCheck size={16} color="white" stroke={3} />
                  </Box>
                )}
              </Box>
            </Tooltip>
          );
        }

        if (option.hexValue) {
          return (
            <Tooltip key={option.id} label={optionName} withArrow>
              <Box
                style={{
                  position: "relative",
                  cursor: "pointer",
                }}
                onClick={() => onToggle(groupSlug, optionSlug, !isSelected)}
              >
                <ColorSwatch
                  color={option.hexValue}
                  size={32}
                  style={{
                    cursor: "pointer",
                    border: isSelected
                      ? "2px solid var(--mantine-color-blue-6)"
                      : "1px solid var(--mantine-color-gray-4)",
                  }}
                />
                {isSelected && (
                  <Box
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      pointerEvents: "none",
                    }}
                  >
                    <IconCheck size={16} color="white" stroke={3} />
                  </Box>
                )}
              </Box>
            </Tooltip>
          );
        }

        return null;
      })}
    </Group>
  );
};

export default ColorSwatchRenderer;
