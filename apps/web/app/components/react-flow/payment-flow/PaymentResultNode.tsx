'use client';

import {
  ActionIcon,
  Checkbox,
  Group,
  MultiSelect,
  NumberInput,
  Paper,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { PaymentProvider, PaymentType } from '@repo/database/client';
import { IconCreditCard, IconTrash } from '@tabler/icons-react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { memo } from 'react';

export type PaymentResultNodeData = {
  label: string;
  providers: PaymentProvider[];
  paymentTypes?: PaymentType[];
  installmentOptions?: {
    enabled: boolean;
    maxInstallment?: number;
  };
  onUpdate?: (data: Partial<PaymentResultNodeData>) => void;
  onDelete?: () => void;
};

export type PaymentResultNodeType = Node<PaymentResultNodeData, 'result'>;

const PROVIDER_LABELS: Record<PaymentProvider, string> = {
  [PaymentProvider.IYZICO]: 'İyzico',
  [PaymentProvider.PAYTR]: 'PayTR',
  [PaymentProvider.STRIPE]: 'Stripe',
  [PaymentProvider.PAYPAL]: 'PayPal',
  [PaymentProvider.BANK_TRANSFER]: 'Banka Havalesi',
};

const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  APP_PAYMENT: 'Uygulama Ödemesi',
  BANK_REDIRECT: 'Banka Yönlendirme',
  GIFT_CARD: 'Hediye Kartı',
  BUY_ONLINE_PAY_AT_STORE: 'Satın Alınca Ödeme',
  CASH: 'Nakit',
  CREDIT_CARD: 'Kredi Kartı',
  CASH_ON_DELIVERY: 'Nakit Teslimat',
  CREDIT_CARD_ON_DELIVERY: 'Kredi Kartı Teslimat',
  DIRECT_DEBIT: 'Banka Havale',
  MONEY_ORDER: 'Para Siparişi',
  OTHER: 'Diğer',
  PAY_LATER: 'Daha Sonra Ödeme',
  SLICE_IT: 'Slice It',
  WALLET: 'Cüzdan',
};

const PaymentResultNode = memo(
  ({ data, selected }: NodeProps<PaymentResultNodeType>) => {
    const {
      label,
      providers,
      paymentTypes,
      installmentOptions,
      onUpdate,
      onDelete,
    } = data;

    const providerOptions = Object.entries(PROVIDER_LABELS).map(
      ([value, label]) => ({
        value,
        label,
      }),
    );

    const paymentTypeOptions = Object.entries(PAYMENT_TYPE_LABELS).map(
      ([value, label]) => ({
        value,
        label,
      }),
    );

    return (
      <Paper
        shadow="sm"
        radius="md"
        withBorder
        style={{
          borderColor: selected
            ? 'var(--mantine-color-green-5)'
            : 'var(--mantine-color-gray-4)',
          borderWidth: selected ? 2 : 1,
          minWidth: 280,
          overflow: 'hidden',
        }}
      >
        <Handle
          type="target"
          position={Position.Top}
          style={{
            width: 24,
            height: 24,
            background: 'var(--mantine-color-gray-5)',
            border: '2px solid var(--mantine-color-body)',
          }}
        />

        <Group
          justify="space-between"
          p="xs"
          style={{
            background: 'var(--mantine-color-green-0)',
            borderBottom: '1px solid var(--mantine-color-gray-3)',
          }}
        >
          <Group gap={8}>
            <IconCreditCard size={16} color="var(--mantine-color-green-6)" />
            <Text size="xs" fw={700} c="green.7" tt="uppercase">
              ÖDEME SONUCU
            </Text>
          </Group>
          <ActionIcon variant="subtle" color="red" size="sm" onClick={onDelete}>
            <IconTrash size={14} />
          </ActionIcon>
        </Group>

        <Stack gap="xs" p="sm">
          <TextInput
            size="xs"
            label="Sonuç Adı"
            placeholder="Örn: Standart Ödeme"
            value={label}
            onChange={(e) => onUpdate?.({ label: e.target.value })}
          />

          <MultiSelect
            size="xs"
            label="Ödeme Sağlayıcıları"
            placeholder="Sağlayıcı seçin"
            data={providerOptions}
            value={providers}
            onChange={(value) =>
              onUpdate?.({ providers: value as PaymentProvider[] })
            }
            searchable
            required
          />

          <MultiSelect
            size="xs"
            label="Ödeme Tipleri"
            placeholder="Tip seçin (opsiyonel)"
            data={paymentTypeOptions}
            value={paymentTypes || []}
            onChange={(value) =>
              onUpdate?.({ paymentTypes: value as PaymentType[] })
            }
            searchable
            clearable
          />

          <Checkbox
            size="xs"
            label="Taksit Seçenekleri"
            checked={installmentOptions?.enabled || false}
            onChange={(e) =>
              onUpdate?.({
                installmentOptions: {
                  enabled: e.target.checked,
                  maxInstallment: installmentOptions?.maxInstallment,
                },
              })
            }
          />

          {installmentOptions?.enabled && (
            <NumberInput
              size="xs"
              label="Maksimum Taksit"
              placeholder="12"
              min={1}
              max={12}
              value={installmentOptions.maxInstallment || ''}
              onChange={(value) =>
                onUpdate?.({
                  installmentOptions: {
                    enabled: true,
                    maxInstallment: value as number,
                  },
                })
              }
            />
          )}
        </Stack>
      </Paper>
    );
  },
);

PaymentResultNode.displayName = 'PaymentResultNode';
export default PaymentResultNode;
