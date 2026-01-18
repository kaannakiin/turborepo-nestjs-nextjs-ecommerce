'use client';

import PriceFormatter from '@/(user)/components/PriceFormatter';
import { getConditionText, getCurrencyLabel } from '@lib/helpers';
import {
  Button,
  Card,
  Divider,
  Group,
  Modal,
  Radio,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { Currency, RuleType } from '@repo/database/client';
import {
  Controller,
  createId,
  SubmitHandler,
  useForm,
  useWatch,
  zodResolver,
} from '@repo/shared';
import { ShippingRuleSchema, ShippingRuleType } from '@repo/types';
import { IconPackage } from '@tabler/icons-react';
import { useEffect } from 'react';
import PriceNumberInput from '../../../../../../components/inputs/PriceNumberInput';

const getSubLabel = (conditionType: RuleType, name?: string) => {
  if (!name?.trim()) return 'Aşağıdaki alanları doldurun';

  return conditionType === 'SalesPrice'
    ? 'Satış fiyatına göre kargo kuralı'
    : 'Ürün ağırlığına göre kargo kuralı';
};

interface ShippingRuleModalProps {
  openedRuleModal: boolean;
  closeRuleModal: () => void;
  defaultValues?: ShippingRuleType;
  onSubmit: SubmitHandler<ShippingRuleType>;
}

const ShippingRuleModal = ({
  openedRuleModal,
  closeRuleModal,
  defaultValues,
  onSubmit,
}: ShippingRuleModalProps) => {
  const { control, handleSubmit, watch, setValue, reset } =
    useForm<ShippingRuleType>({
      resolver: zodResolver(ShippingRuleSchema),
      defaultValues: defaultValues || {
        uniqueId: createId(),
        condition: {
          type: 'SalesPrice',
          minSalesPrice: null,
          maxSalesPrice: null,
        },
        currency: 'TRY',
        name: '',
        shippingPrice: null,
      },
    });
  useEffect(() => {
    if (openedRuleModal) {
      if (defaultValues) {
        reset(defaultValues);
      } else {
        reset({
          uniqueId: createId(),
          condition: {
            type: 'SalesPrice',
            minSalesPrice: null,
            maxSalesPrice: null,
          },
          currency: 'TRY',
          name: '',
          shippingPrice: null,
        });
      }
    }
  }, [openedRuleModal, defaultValues, reset]);

  const conditionType = useWatch({ control, name: 'condition.type' });
  const price = useWatch({ control, name: 'shippingPrice' });
  const name = useWatch({ control, name: 'name' });
  const currency = useWatch({ control, name: 'currency' });
  const data = useWatch({ control });

  return (
    <Modal.Root
      classNames={{
        title: 'text-lg font-medium',
        header: 'border-b border-b-gray-500',
        body: 'py-4',
      }}
      centered
      size="lg"
      opened={openedRuleModal}
      onClose={closeRuleModal}
    >
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>Kural Ekle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Stack gap={'md'}>
            <Card bg={'gray.5'} p="md">
              <Group justify="space-between">
                <Text fz={'xs'} c="white">
                  Kural{' '}
                  {conditionType === 'ProductWeight'
                    ? '(Ağırlık)'
                    : '(Satış Fiyatı)'}
                </Text>
                <Text fz={'xs'} c={'white'}>
                  {getConditionText(data as ShippingRuleType)}
                </Text>
              </Group>
              <Divider my={'xs'} />
              <Group justify="space-between">
                <Group gap="xs">
                  <IconPackage size={16} color="white" />
                  <Text fz={'xs'} c="white">
                    {name?.trim() ? name : getSubLabel(conditionType)}
                  </Text>
                </Group>
                {price > 0 ? (
                  <Group gap={'1px'} wrap="nowrap" align="center">
                    <PriceFormatter
                      fz={'xs'}
                      c={'white'}
                      price={price}
                      currency={currency}
                    />
                  </Group>
                ) : (
                  <Text fz={'xs'} c={'white'}>
                    Ücretsiz Kargo
                  </Text>
                )}
              </Group>
            </Card>

            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  data-autofocus
                  error={fieldState.error?.message}
                  label="Kural Adı"
                  withAsterisk
                  size="xs"
                />
              )}
            />
            <SimpleGrid cols={2}>
              <Controller
                control={control}
                name="currency"
                render={({ field, fieldState }) => (
                  <Select
                    {...field}
                    error={fieldState.error?.message}
                    label="Para Birimi"
                    withAsterisk
                    allowDeselect={false}
                    size="xs"
                    data={Object.values(Currency).map((currency) => ({
                      value: currency,
                      label: getCurrencyLabel(currency),
                    }))}
                  />
                )}
              />
              <Controller
                control={control}
                name="shippingPrice"
                render={({ field }) => (
                  <PriceNumberInput
                    {...field}
                    onChange={(value) => {
                      if (
                        value === '' ||
                        value === null ||
                        value === undefined
                      ) {
                        field.onChange(null);
                      } else {
                        field.onChange(Number(value));
                      }
                    }}
                    label="Kargo Fiyatı"
                    size="xs"
                  />
                )}
              />
            </SimpleGrid>
            <Divider mt={'xs'} size={'md'} />

            <Controller
              control={control}
              name="condition.type"
              render={({ field }) => (
                <Radio.Group
                  {...field}
                  onChange={(value) => {
                    if (value === conditionType) {
                      console.log('same value');
                      return;
                    }

                    field.onChange(value);

                    if (value === 'SalesPrice') {
                      setValue('condition', {
                        type: 'SalesPrice',
                        minSalesPrice: null,
                        maxSalesPrice: null,
                      });
                    } else {
                      setValue('condition', {
                        type: 'ProductWeight',
                        minProductWeight: null,
                        maxProductWeight: null,
                      });
                    }
                  }}
                  label={
                    <Text fz={'md'} fw={700} mb={'xs'}>
                      Kurallar
                    </Text>
                  }
                >
                  <Group>
                    <Radio
                      size="xs"
                      value={'SalesPrice'}
                      label={
                        <Text fz={'xs'} c="black">
                          Satış Fiyatı
                        </Text>
                      }
                    />
                    <Radio
                      value={'ProductWeight'}
                      size="xs"
                      label={
                        <Text fz={'xs'} c="black">
                          Ağırlık
                        </Text>
                      }
                    />
                  </Group>
                </Radio.Group>
              )}
            />
            <SimpleGrid cols={2}>
              {conditionType === 'ProductWeight' ? (
                <>
                  <Controller
                    control={control}
                    name="condition.minProductWeight"
                    render={({ field, fieldState }) => (
                      <PriceNumberInput
                        label="Minimum Ağırlık (g)"
                        size="xs"
                        value={field.value ?? ''}
                        onChange={(value) => {
                          if (
                            value === '' ||
                            value === null ||
                            value === undefined
                          ) {
                            field.onChange(null);
                          } else {
                            field.onChange(Number(value));
                          }
                        }}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="condition.maxProductWeight"
                    render={({ field, fieldState }) => (
                      <PriceNumberInput
                        label="Maksimum Ağırlık (g)"
                        value={field.value ?? ''}
                        onChange={(value) => {
                          if (
                            value === '' ||
                            value === null ||
                            value === undefined
                          ) {
                            field.onChange(null);
                          } else {
                            field.onChange(Number(value));
                          }
                        }}
                        size="xs"
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </>
              ) : (
                <>
                  <Controller
                    control={control}
                    name="condition.minSalesPrice"
                    render={({ field, fieldState }) => (
                      <PriceNumberInput
                        label="Minimum Satış Fiyatı"
                        size="xs"
                        value={field.value ?? ''}
                        onChange={(value) => {
                          if (
                            value === '' ||
                            value === null ||
                            value === undefined
                          ) {
                            field.onChange(null);
                          } else {
                            field.onChange(Number(value));
                          }
                        }}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="condition.maxSalesPrice"
                    render={({ field, fieldState }) => (
                      <PriceNumberInput
                        label="Maksimum Satış Fiyatı"
                        size="xs"
                        value={field.value ?? ''}
                        onChange={(value) => {
                          if (
                            value === '' ||
                            value === null ||
                            value === undefined
                          ) {
                            field.onChange(null);
                          } else {
                            field.onChange(Number(value));
                          }
                        }}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </>
              )}
            </SimpleGrid>
            <Group justify="end">
              <Button variant="default" onClick={closeRuleModal}>
                İptal
              </Button>
              <Button variant="filled" onClick={handleSubmit(onSubmit)}>
                Kaydet
              </Button>
            </Group>
          </Stack>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};

export default ShippingRuleModal;
