import '@blocknote/mantine/blocknoteStyles.css';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { ReactNode } from 'react';
import LayoutProviderWrapper from './components/LayoutProviderWrapper';
import './globals.css';
import DeviceProvider from './context/device-context/DeviceContext';
import { NextIntlClientProvider } from 'next-intl';

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="tr" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript forceColorScheme="light" defaultColorScheme="auto" />
      </head>
      <body className="relative" suppressHydrationWarning={true}>
        <NextIntlClientProvider>
          <LayoutProviderWrapper>
            <DeviceProvider>{children}</DeviceProvider>
          </LayoutProviderWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
