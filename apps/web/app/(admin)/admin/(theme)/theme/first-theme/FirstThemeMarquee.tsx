"use client";
import CustomImage from "@/components/CustomImage";
import { Marquee } from "@gfazioli/mantine-marquee";
import { Anchor, Box, Text } from "@mantine/core";
import { MarqueeComponentInputType } from "@repo/types";
import { useEffect, useState } from "react";

interface FirstThemeMarqueeProps {
  data: MarqueeComponentInputType;
}

interface ProcessedItem {
  itemId: string;
  type: "text" | "image";
  content: string;
  link?: string | null;
}

const FirstThemeMarquee = ({ data }: FirstThemeMarqueeProps) => {
  const { items, options } = data;
  const [processedItems, setProcessedItems] = useState<ProcessedItem[]>([]);

  useEffect(() => {
    const baseProcessed: ProcessedItem[] = items
      ?.map((item): ProcessedItem | null => {
        if (item.image) {
          const url = URL.createObjectURL(item.image);
          return {
            itemId: item.itemId,
            type: "image",
            content: url,
            link: item.link,
          };
        }

        if (item.existingImage) {
          return {
            itemId: item.itemId,
            type: "image",
            content: item.existingImage.url,
            link: item.link,
          };
        }

        if (item.text && item.text.trim() !== "") {
          return {
            itemId: item.itemId,
            type: "text",
            content: item.text,
            link: item.link,
          };
        }

        return null;
      })
      .filter((item): item is ProcessedItem => item !== null);

    let finalItems = [...baseProcessed];

    if (baseProcessed.length > 0) {
      while (finalItems.length < 20) {
        finalItems = [...finalItems, ...baseProcessed];
      }

      finalItems = [...finalItems, ...baseProcessed, ...baseProcessed];
    }

    setProcessedItems(finalItems);

    return () => {
      baseProcessed.forEach((item) => {
        if (item.type === "image" && item.content.startsWith("blob:")) {
          URL.revokeObjectURL(item.content);
        }
      });
    };
  }, [items]);

  if (processedItems.length === 0) {
    return null;
  }

  const renderItem = (item: ProcessedItem, index: number) => {
    const uniqueKey = `${item.itemId}-${index}`;

    const content =
      item.type === "text" ? (
        <Text
          component="span"
          size={options.fontSize || "md"}
          fw={options.fontWeight || "normal"}
          c={options.textColor || undefined}
          style={{ whiteSpace: "nowrap" }}
        >
          {item.content}
        </Text>
      ) : (
        <Box
          w={
            options.fontSize === "xs"
              ? "80px"
              : options.fontSize === "sm"
                ? "100px"
                : options.fontSize === "md"
                  ? "120px"
                  : "140px"
          }
          style={{ flexShrink: 0 }}
        >
          <CustomImage src={item.content} alt="Marquee item" />
        </Box>
      );

    const wrapperStyle = { display: "flex", alignItems: "center" };

    if (item.link) {
      return (
        <Anchor
          key={uniqueKey}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none", ...wrapperStyle }}
        >
          {content}
        </Anchor>
      );
    }

    return (
      <Box key={uniqueKey} style={wrapperStyle}>
        {content}
      </Box>
    );
  };

  return (
    <Marquee
      bg={options.backgroundColor || undefined}
      duration={options.speed}
      pauseOnHover={options.pauseOnHover}
      reverse={options.isReverse}
      py={options.paddingY || "md"}
      gap="xl"
    >
      {processedItems.map((item, index) => renderItem(item, index))}
    </Marquee>
  );
};

export default FirstThemeMarquee;
