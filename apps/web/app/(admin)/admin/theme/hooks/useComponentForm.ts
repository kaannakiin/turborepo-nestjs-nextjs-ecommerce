'use client';

import type { DefaultValues, FieldValues, Path, Resolver } from '@repo/shared';
import { useForm, zodResolver } from '@repo/shared';
import { ZodObject, z } from '@repo/types';
import { useCallback, useEffect } from 'react';
import { useDesignStore } from '../store/design-store';

export function useComponentForm<T extends ZodObject>(
  schema: T,
  uniqueId: string,
) {
  type FormData = z.infer<T>;

  const data = useDesignStore((s) => s.findByUniqueId<FormData>(uniqueId));
  const updateByUniqueId = useDesignStore((s) => s.updateByUniqueId);

  const form = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: (data ?? {}) as DefaultValues<FormData>,
  });

  const handleFieldChange = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      form.setValue(
        key as unknown as Path<FormData>,
        value as FieldValues[string],
      );
      updateByUniqueId(uniqueId, { [key]: value } as Partial<
        Record<string, unknown>
      >);
    },
    [form, updateByUniqueId, uniqueId],
  );

  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data, form]);

  return {
    form,
    data,
    handleFieldChange,

    control: form.control,
    watch: form.watch,
    setValue: form.setValue,
    getValues: form.getValues,
    formState: form.formState,
  };
}

export function useItemForm<T extends ZodObject>(
  schema: T,
  uniqueId: string,
  _parentUniqueId: string,
) {
  return useComponentForm(schema, uniqueId);
}
