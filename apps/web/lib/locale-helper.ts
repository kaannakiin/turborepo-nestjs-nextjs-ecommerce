import { Currency, Locale } from '@repo/database/client';
import { CartContextUpdateResponse } from '@repo/types';
import fetchWrapper from './wrappers/fetchWrapper';

export async function changeLocale(locale: Locale): Promise<void> {
  try {
    const response = await fetch('/api/locale', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ locale }),
    });

    if (!response.ok) {
      throw new Error('Failed to change locale');
    }

    window.location.reload();
  } catch (error) {
    console.error('Error changing locale:', error);
    throw error;
  }
}

export async function changeLocaleAndRedirect(
  locale: Locale,
  redirectTo?: string,
): Promise<void> {
  try {
    const response = await fetch('/api/locale', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ locale }),
    });

    if (!response.ok) {
      throw new Error('Failed to change locale');
    }

    window.location.href = redirectTo || window.location.pathname;
  } catch (error) {
    console.error('Error changing locale:', error);
    throw error;
  }
}

export async function updateCartContext(
  locale: Locale,
  currency: Currency,
): Promise<CartContextUpdateResponse | null> {
  try {
    const response = await fetchWrapper.post<CartContextUpdateResponse>(
      '/cart/update-context',
      { locale, currency },
    );

    if (!response.success) {
      console.error('Cart context update failed');
      return null;
    }

    return response.data;
  } catch (error) {
    console.error('Error updating cart context:', error);
    return null;
  }
}

export async function changeLocaleWithCartSync(
  locale: Locale,
  currency: Currency,
): Promise<CartContextUpdateResponse | null> {
  await changeLocale(locale);

  return updateCartContext(locale, currency);
}
