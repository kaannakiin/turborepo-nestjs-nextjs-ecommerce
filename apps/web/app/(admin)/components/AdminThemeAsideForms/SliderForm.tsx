"use client";
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Image,
  InputDescription,
  InputError,
  InputLabel,
  Stack,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  Controller,
  createId,
  SubmitHandler,
  useForm,
  zodResolver,
} from "@repo/shared";
import { SliderV2Schema, SliderType } from "@repo/types";
import { IconX } from "@tabler/icons-react";
import GlobalDropzone from "../../../components/GlobalDropzone";
import fetchWrapper from "@lib/fetchWrapper";
import { $Enums } from "@repo/database";

interface SliderFormProps {
  defaultValues?: SliderType;
  onSubmit: SubmitHandler<SliderType>;
}

interface ExistingAssetProps {
  url: string;
  type: $Enums.AssetType;
  onRemove: () => Promise<void>;
}

const ExistingAsset = ({ url, type, onRemove }: ExistingAssetProps) => {
  return (
    <Box className="relative group border rounded-lg p-2 bg-gray-50">
      {type === "IMAGE" ? (
        <Image
          src={url}
          alt="Existing asset"
          className="w-full h-48 object-contain rounded"
        />
      ) : (
        <video
          src={url}
          className="w-full h-48 object-contain rounded"
          controls
          muted
        >
          Tarayıcınız video elementini desteklemiyor.
        </video>
      )}

      <Group className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ActionIcon variant="filled" color="red" size="sm" onClick={onRemove}>
          <IconX size={14} />
        </ActionIcon>
      </Group>
    </Box>
  );
};

const SliderForm = ({ defaultValues, onSubmit }: SliderFormProps) => {
  const {
    control,
    handleSubmit,
    clearErrors,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SliderType>({
    resolver: zodResolver(SliderV2Schema),
    defaultValues: defaultValues || {
      uniqueId: createId(),
      customLink: "",
      desktopAsset: null,
      mobileAsset: null,
    },
  });

  const existingDesktop = watch("existingDesktopAsset");
  const existingMobile = watch("existingMobileAsset");
  const uniqueId = watch("uniqueId");
  const onRemove = async (uniqueId: string, type: "DESKTOP" | "MOBILE") => {
    const res = await fetchWrapper.delete(
      `/admin/theme/delete-slider/${uniqueId}?type=${type}`
    );
    if (res.success) {
      if (type === "DESKTOP") {
        setValue("existingDesktopAsset", null);
      } else {
        setValue("existingMobileAsset", null);
      }
      notifications.show({
        title: "Başarılı",
        message: "Slider başarıyla silindi.",
        color: "green",
        autoClose: 3000,
      });
    }
  };
  return (
    <Stack gap={"xl"}>
      <Controller
        control={control}
        name="desktopAsset"
        render={({ field, fieldState }) => (
          <Stack gap={"xs"}>
            <InputLabel>Desktop Asset</InputLabel>
            {existingDesktop ? (
              <ExistingAsset
                url={existingDesktop.url}
                type={existingDesktop.type}
                onRemove={async () => {
                  await onRemove(uniqueId || "", "DESKTOP");
                }}
              />
            ) : (
              <>
                <InputDescription>
                  Masaüstü için kullanılacak görsel veya video (1920x1080px
                  önerilir)
                </InputDescription>
                <GlobalDropzone
                  accept={["IMAGE", "VIDEO"]}
                  onDrop={(files) => {
                    field.onChange(files[0]);
                  }}
                  value={field.value || null}
                  cols={1}
                  multiple={false}
                  maxFiles={1}
                  maxSize={10 * 1024 * 1024}
                />
              </>
            )}

            {fieldState.error && (
              <InputError>{fieldState.error.message}</InputError>
            )}
          </Stack>
        )}
      />

      <Stack gap={"xs"}>
        <InputLabel>Mobil Asset</InputLabel>
        <Controller
          control={control}
          name="mobileAsset"
          render={({ field, fieldState }) => (
            <>
              {existingMobile ? (
                <ExistingAsset
                  url={existingMobile.url}
                  type={existingMobile.type}
                  onRemove={async () => {
                    await onRemove(uniqueId || "", "MOBILE");
                  }}
                />
              ) : (
                <>
                  <InputDescription>
                    Mobil için kullanılacak görsel veya video (1080x1080px
                    önerilir)
                  </InputDescription>
                  <GlobalDropzone
                    accept={["IMAGE", "VIDEO"]}
                    onDrop={(files) => {
                      field.onChange(files[0]);
                    }}
                    value={field.value || []}
                    cols={1}
                    multiple={false}
                    maxFiles={1}
                    error={fieldState.error?.message}
                    maxSize={10 * 1024 * 1024}
                  />
                </>
              )}
            </>
          )}
        />
      </Stack>

      <Controller
        control={control}
        name="customLink"
        render={({ field, fieldState }) => (
          <TextInput
            type="url"
            {...field}
            error={fieldState.error?.message}
            label="Slider Linki"
            description="Slider tıklandığında yönlendirilecek URL"
          />
        )}
      />
      {errors && (
        <InputError>
          {Object.values(errors)
            .map((err) => err.message)
            .join(", ")}
        </InputError>
      )}
      <Group justify="flex-end">
        <Button
          variant="filled"
          onClick={() => {
            handleSubmit(onSubmit)();

            setTimeout(() => {
              clearErrors();
            }, 3000);
          }}
        >
          Kaydet
        </Button>
      </Group>
    </Stack>
  );
};

export default SliderForm;
