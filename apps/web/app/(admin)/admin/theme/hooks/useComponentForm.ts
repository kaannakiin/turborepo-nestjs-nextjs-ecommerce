'use client';

import type { DefaultValues, FieldValues, Path, Resolver } from '@repo/shared';
import { useForm, zodResolver } from '@repo/shared';
import { ZodObject, z } from '@repo/types';
import { useCallback, useEffect, useRef } from 'react';
import { useDesignStore } from '../store/design-store';

export function useComponentForm<T extends ZodObject>(
  schema: T,
  uniqueId: string,
) {
  type FormData = z.infer<T>;

  const updateByUniqueId = useDesignStore((s) => s.updateByUniqueId);

  const prevUniqueIdRef = useRef<string>(uniqueId);
  const initialDataRef = useRef<FormData | null>(null);

  if (initialDataRef.current === null || prevUniqueIdRef.current !== uniqueId) {
    initialDataRef.current = useDesignStore
      .getState()
      .findByUniqueId<FormData>(uniqueId);
    prevUniqueIdRef.current = uniqueId;
  }

  const form = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: (initialDataRef.current ?? {}) as DefaultValues<FormData>,
  });

  useEffect(() => {
    const newData = useDesignStore
      .getState()
      .findByUniqueId<FormData>(uniqueId);
    if (newData) {
      initialDataRef.current = newData;
      form.reset(newData as DefaultValues<FormData>);
    }
  }, [uniqueId, form]);

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

  const formValues = form.watch();

  const data = { ...initialDataRef.current, ...formValues } as FormData;

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
