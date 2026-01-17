'use client';

import { getLocaleLabel } from '@lib/helpers';
import { changeLocale, updateCartContext } from '@lib/locale-helper';
import { Select } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Currency, Locale } from '@repo/database/client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export interface LocaleCurrencyMapping {
  locale: Locale;
  currency: Currency;
}

export interface LanguageSwitcherProps {
  availableLocales: Locale[];
  currentLocale: Locale;
  localeCurrencyMap: LocaleCurrencyMapping[];
  className?: string;
}

const LOCALE_TO_COUNTRY: Record<Locale, string> = {
  TR: 'tr',
  EN: 'gb',
  DE: 'de',
};

export function LanguageSwitcher({
  availableLocales,
  currentLocale,
  localeCurrencyMap,
  className = '',
}: LanguageSwitcherProps) {
  const [isChanging, setIsChanging] = useState(false);
  const { refresh } = useRouter();

  const getCurrencyForLocale = (locale: Locale): Currency => {
    const mapping = localeCurrencyMap.find((m) => m.locale === locale);
    return mapping?.currency || 'TRY';
  };

  const handleLocaleChange = async (newLocale: Locale) => {
    if (newLocale === currentLocale || isChanging) return;

    setIsChanging(true);
    try {
      // 1. Locale cookie'sini set et
      await changeLocale(newLocale);

      // 2. Sepet context'ini güncelle
      const newCurrency = getCurrencyForLocale(newLocale);
      const cartResult = await updateCartContext(newLocale, newCurrency);

      // 3. Invalid items varsa kullanıcıya bildir
      if (cartResult?.invalidItems && cartResult.invalidItems.length > 0) {
        const itemNames = cartResult.invalidItems
          .map((i) => i.productName)
          .join(', ');

        notifications.show({
          title: 'Sepetiniz güncellendi',
          message: `Şu ürünler seçtiğiniz dil/para biriminde mevcut değil: ${itemNames}`,
          color: 'yellow',
          autoClose: 5000,
        });
      }

      // 4. Restore edilen items varsa bildir
      if (cartResult?.restoredItems && cartResult.restoredItems.length > 0) {
        notifications.show({
          title: 'Ürünler geri yüklendi',
          message: `${cartResult.restoredItems.length} ürün sepetinize geri eklendi`,
          color: 'green',
          autoClose: 3000,
        });
      }

      refresh();
    } catch (error) {
      console.error('Failed to change locale:', error);
      notifications.show({
        title: 'Hata',
        message: 'Dil değiştirilemedi',
        color: 'red',
      });
    } finally {
      setIsChanging(false);
    }
  };

  const getFlagUrl = (locale: Locale) => {
    const countryCode = LOCALE_TO_COUNTRY[locale];
    return `https://flagcdn.com/w40/${countryCode}.png`;
  };

  return (
    <div className={`relative ${className}`}>
      <Select
        data={availableLocales.map((locale) => ({
          value: locale,
          label: getLocaleLabel(locale),
        }))}
        value={currentLocale}
        onChange={(value) => {
          if (value) handleLocaleChange(value as Locale);
        }}
        allowDeselect={false}
        disabled={isChanging}
        leftSection={
          <Image
            src={getFlagUrl(currentLocale)}
            alt={currentLocale}
            width={20}
            height={15}
            style={{ objectFit: 'cover' }}
          />
        }
        renderOption={({ option }) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Image
              src={getFlagUrl(option.value as Locale)}
              alt={option.value}
              width={20}
              height={15}
              style={{ objectFit: 'cover' }}
            />
            <span>{option.label}</span>
          </div>
        )}
      />
    </div>
  );
}
