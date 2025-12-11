"use client";

import GlobalDropzone from "@/components/GlobalDropzone";
import { ActionIcon, InputLabel, TextInput } from "@mantine/core";
import { Control, Controller, useWatch } from "@repo/shared";
import {
  MarqueeComponentInputType,
  PageInputType,
  ThemeInputType,
} from "@repo/types";
import { IconLink } from "@tabler/icons-react";

interface MarqueeItemFormProps {
  index: number;
  control: Control<ThemeInputType>;
  componentIndex: number;
  pageIndex: number;
}

const MarqueeItemForm = ({
  control,
  index,
  componentIndex,
  pageIndex,
}: MarqueeItemFormProps) => {
  const prefix =
    `pages.${pageIndex}.components.${componentIndex}.items.${index}` as const;
  const data = useWatch({
    control,
    name: prefix,
  }) as MarqueeComponentInputType["items"][number];
  return (
    <>
      <Controller
        control={control}
        name={`${prefix}.text`}
        render={({ field, fieldState }) => (
          <TextInput
            {...field}
            error={fieldState.error?.message}
            label="Yazı"
          />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.link`}
        render={({ field, fieldState }) => (
          <TextInput
            {...field}
            error={fieldState.error?.message}
            label="Link"
            rightSection={
              <ActionIcon
                variant="transparent"
                size={"md"}
                onClick={() => {
                  if (field.value) {
                    window.open(field.value);
                  }
                }}
                disabled={!field.value}
              >
                <IconLink />
              </ActionIcon>
            }
          />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.image`}
        render={({ field, fieldState }) => (
          <div className="flex flex-col gap-1">
            <InputLabel>Medya</InputLabel>
            <GlobalDropzone
              {...field}
              multiple={false}
              maxSize={5 * 1024 * 1024}
              maxFiles={data?.existingImage ? 0 : 1}
              onDrop={(files) => {
                if (!files.length) return;
                field.onChange(files[0]);
              }}
              accept={["IMAGE", "VIDEO"]}
              cols={1}
              error={fieldState.error?.message}
              existingImages={data?.existingImage ? [data.existingImage] : []}
              existingImagesDelete={async (url) => {
                console.log("Delete desktop image:", url);
              }}
            />
          </div>
        )}
      />
    </>
  );
};

export default MarqueeItemForm;
