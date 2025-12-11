"use client";
import GlobalDropzone from "@/components/GlobalDropzone";
import { InputLabel, Switch } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import {
  Control,
  Controller,
  DateFormatter,
  UseFormSetValue,
  useWatch,
} from "@repo/shared";
import { ThemeInputType } from "@repo/types";

interface SlideFormProps {
  control: Control<ThemeInputType>;
  setValue: UseFormSetValue<ThemeInputType>;
  componentIndex: number;
  slideIndex: number;
  pageIndex: number;
}

const SlideForm = ({
  control,
  componentIndex,
  slideIndex,
  setValue,
  pageIndex,
}: SlideFormProps) => {
  const prefix =
    `pages.${pageIndex}.components.${componentIndex}.sliders.${slideIndex}` as const;
  const data = useWatch({ control, name: prefix });

  const startDateValue = data?.conditionDates?.startDate
    ? DateFormatter.parseIsoString(data.conditionDates.startDate)
    : undefined;

  const endDateValue = data?.conditionDates?.endDate
    ? DateFormatter.parseIsoString(data.conditionDates.endDate)
    : undefined;

  const minEndDate = startDateValue
    ? new Date(startDateValue.getTime() + 10 * 60 * 1000)
    : undefined;

  const maxStartDate = endDateValue
    ? new Date(endDateValue.getTime() - 10 * 60 * 1000)
    : undefined;

  return (
    <>
      <Controller
        control={control}
        name={`${prefix}.desktopView.file`}
        render={({ field, fieldState }) => (
          <div className="flex flex-col gap-1">
            <InputLabel>Desktop Görünümü</InputLabel>
            <GlobalDropzone
              {...field}
              multiple={false}
              maxSize={5 * 1024 * 1024}
              maxFiles={data?.desktopView?.existingAsset ? 0 : 1}
              onDrop={(files) => {
                if (!files.length) return;
                field.onChange(files[0]);
              }}
              accept={["IMAGE", "VIDEO"]}
              cols={1}
              error={fieldState.error?.message}
              existingImages={
                data?.desktopView?.existingAsset
                  ? [data.desktopView.existingAsset]
                  : []
              }
              existingImagesDelete={async (url) => {
                setValue(`${prefix}.desktopView.existingAsset`, null);
              }}
            />
          </div>
        )}
      />

      <Controller
        control={control}
        name={`${prefix}.mobileView.file`}
        render={({ field, fieldState }) => (
          <div className="flex flex-col gap-1">
            <InputLabel>Mobil Görünümü</InputLabel>
            <GlobalDropzone
              {...field}
              multiple={false}
              maxSize={5 * 1024 * 1024}
              maxFiles={data?.mobileView?.existingAsset ? 0 : 1}
              onDrop={(files) => {
                if (!files.length) return;
                field.onChange(files[0]);
              }}
              accept={["IMAGE", "VIDEO"]}
              cols={1}
              error={fieldState.error?.message}
              existingImages={
                data?.mobileView?.existingAsset
                  ? [data.mobileView.existingAsset]
                  : []
              }
              existingImagesDelete={async (url) => {
                console.log("Delete mobile image:", url);
              }}
            />
          </div>
        )}
      />

      <Controller
        control={control}
        name={`${prefix}.conditionDates.addStartDate`}
        render={({ field: { value, ...field } }) => (
          <Switch checked={value} {...field} label="Başlangıç Tarihi Ekle" />
        )}
      />
      {data?.conditionDates?.addStartDate && (
        <Controller
          control={control}
          name={`${prefix}.conditionDates.startDate`}
          render={({ field, fieldState }) => (
            <DateTimePicker
              {...field}
              label="Başlangıç Tarihi"
              error={fieldState.error?.message}
              value={field.value ? new Date(field.value) : null}
              onChange={(dateString) => {
                field.onChange(DateFormatter.toISOString(dateString));
              }}
              maxDate={maxStartDate}
            />
          )}
        />
      )}

      <Controller
        control={control}
        name={`${prefix}.conditionDates.addEndDate`}
        render={({ field: { value, ...field } }) => (
          <Switch checked={value} {...field} label="Bitiş Tarihi Ekle" />
        )}
      />
      {data?.conditionDates?.addEndDate && (
        <Controller
          control={control}
          name={`${prefix}.conditionDates.endDate`}
          render={({ field, fieldState }) => (
            <DateTimePicker
              {...field}
              label="Bitiş Tarihi"
              error={fieldState.error?.message}
              value={field.value ? new Date(field.value) : null}
              onChange={(dateString) => {
                field.onChange(DateFormatter.toISOString(dateString));
              }}
              minDate={minEndDate}
            />
          )}
        />
      )}
    </>
  );
};

export default SlideForm;
