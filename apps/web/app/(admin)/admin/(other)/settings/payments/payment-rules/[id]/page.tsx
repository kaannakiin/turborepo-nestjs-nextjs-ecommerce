'use client';

import LoadingOverlay from '@/components/LoadingOverlay';
import { FlowDrawer } from '@/components/react-flow/FlowDrawer';
import PaymentConditionGroupNode from '@/components/react-flow/payment-flow/PaymentConditionGroupNode';
import PaymentConditionNode from '@/components/react-flow/payment-flow/PaymentConditionNode';
import PaymentResultNode, {
  PaymentResultNodeData,
} from '@/components/react-flow/payment-flow/PaymentResultNode';
import StartNode from '@/components/react-flow/StartNode';
import {
  useCreatePaymentRule,
  usePaymentRule,
  useUpdatePaymentRule,
} from '@hooks/admin/usePaymentRules';
import {
  Button,
  Checkbox,
  Group,
  NumberInput,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Controller, SubmitHandler, useForm, zodResolver } from '@repo/shared';
import {
  CreatePaymentRuleZodInput,
  CreatePaymentRuleZodOutput,
  PaymentRuleZodSchema,
  PaymentRuleCondition,
  PaymentRuleConditionField,
  PaymentRuleTreeSchema,
} from '@repo/types';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import type { Edge, Node } from '@xyflow/react';
import type { Route } from 'next';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import FormCard from '../../../../../../../components/cards/FormCard';

const getPaymentNodeLabel = (node: Node) => {
  if (node.type === 'start') return 'Başlangıç';
  if (node.type === 'result')
    return (node.data as { label: string }).label || 'Sonuç';
  if (node.type === 'condition') return 'Koşul';
  if (node.type === 'conditionGroup') return 'Koşul Grubu';
  return 'Bilinmeyen';
};

const PaymentRuleEditorPage = () => {
  const params = useParams();
  const { push } = useRouter();
  const id = params.id as string;
  const isNew = id === 'new';

  const [opened, { open, close }] = useDisclosure(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreatePaymentRuleZodInput>({
    resolver: zodResolver(PaymentRuleZodSchema),
    defaultValues: {
      name: '',
      priority: 0,
      isActive: true,
      isDefault: false,
      flowData: undefined,
    },
  });

  const flowData = watch('flowData');

  const { data: existingRule, isLoading } = usePaymentRule(isNew ? null : id);
  const createMutation = useCreatePaymentRule();
  const updateMutation = useUpdatePaymentRule();

  useEffect(() => {
    if (existingRule) {
      reset({
        name: existingRule.name,
        priority: existingRule.priority,
        isActive: existingRule.isActive,
        isDefault: existingRule.isDefault,
        flowData:
          existingRule.flowData as CreatePaymentRuleZodOutput['flowData'],
      });
    }
  }, [existingRule, reset]);

  const handleFlowSave = (data: { nodes: Node[]; edges: Edge[] }) => {
    try {
      const { success, data: parsedData } = PaymentRuleTreeSchema.safeParse({
        nodes: data.nodes,
        edges: data.edges,
      });
      if (!success) {
        notifications.show({
          message: 'Karar ağacı doğrulanamadı',
          color: 'red',
        });
        console.log('here');
        return;
      }
      setValue('flowData', parsedData, { shouldValidate: true });
      close();
    } catch (error) {
      notifications.show({
        message: 'Karar ağacı doğrulanamadı',
        color: 'red',
      });
    }
  };

  const onSubmit: SubmitHandler<CreatePaymentRuleZodOutput> = (data) => {
    if (isNew) {
      createMutation.mutate(data, {
        onSuccess: () => {
          notifications.show({
            message: 'Ödeme kuralı oluşturuldu',
            color: 'green',
          });
          push('/admin/settings/payments/payment-rules' as Route);
        },
      });
    } else {
      updateMutation.mutate(
        { id, data },
        {
          onSuccess: () => {
            notifications.show({
              message: 'Ödeme kuralı güncellendi',
              color: 'green',
            });
            push('/admin/settings/payments/payment-rules' as Route);
          },
        },
      );
    }
  };

  const nodeComponents = useMemo(
    () => ({
      start: StartNode,
      condition: PaymentConditionNode,
      conditionGroup: PaymentConditionGroupNode,
      result: PaymentResultNode,
    }),
    [],
  );

  return (
    <>
      {isLoading && <LoadingOverlay />}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="xl">
          <FormCard
            title={
              <Group p="md" justify="space-between" align="center">
                <Group>
                  <Button
                    variant="subtle"
                    leftSection={<IconArrowLeft size={16} />}
                    onClick={() =>
                      push('/admin/settings/payments/payment-rules' as Route)
                    }
                  >
                    Geri
                  </Button>
                  <Title order={4}>
                    {isNew ? 'Yeni Ödeme Kuralı' : 'Kuralı Düzenle'}
                  </Title>
                </Group>
                <Button
                  leftSection={<IconDeviceFloppy size={16} />}
                  type="submit"
                  loading={createMutation.isPending || updateMutation.isPending}
                >
                  Kaydet
                </Button>
              </Group>
            }
          >
            <Stack gap="md" p="md">
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    label="Kural Adı"
                    placeholder="Örn: Yüksek Tutarlı Siparişler"
                    error={errors.name?.message}
                    withAsterisk
                  />
                )}
              />

              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <NumberInput
                    {...field}
                    label="Öncelik"
                    description="Düşük sayı = yüksek öncelik"
                    placeholder="0"
                    min={0}
                    onChange={(val) => field.onChange(val)}
                    error={errors.priority?.message}
                  />
                )}
              />

              <Group>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field: { value, onChange, ...field } }) => (
                    <Checkbox
                      {...field}
                      label="Aktif"
                      checked={value}
                      onChange={(e) => onChange(e.target.checked)}
                    />
                  )}
                />
                <Controller
                  name="isDefault"
                  control={control}
                  render={({ field: { value, onChange, ...field } }) => (
                    <Checkbox
                      {...field}
                      label="Varsayılan Kural"
                      checked={value}
                      onChange={(e) => onChange(e.target.checked)}
                    />
                  )}
                />
              </Group>

              <Button variant="outline" onClick={open}>
                {flowData ? 'Karar Ağacını Düzenle' : 'Karar Ağacı Oluştur'}
              </Button>
              {errors.flowData && (
                <div className="text-red-500 text-sm">
                  {errors.flowData.message}
                </div>
              )}
            </Stack>
          </FormCard>
        </Stack>
      </form>

      <FlowDrawer<
        PaymentRuleConditionField,
        PaymentRuleCondition,
        PaymentResultNodeData
      >
        opened={opened}
        onClose={close}
        onSave={handleFlowSave}
        initialData={flowData}
        domainName="paymentRule"
        defaultField={PaymentRuleConditionField.CART_TOTAL}
        getNodeLabel={getPaymentNodeLabel}
        nodeComponents={nodeComponents}
      />
    </>
  );
};

export default PaymentRuleEditorPage;
