import '@blocknote/mantine/blocknoteStyles.css';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { ReactNode } from 'react';
import LayoutProviderWrapper from './components/LayoutProviderWrapper';
import './globals.css';
import ThemeProvider from './context/theme-context/ThemeContext';
import { NextIntlClientProvider } from 'next-intl';

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="tr" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body className="relative" suppressHydrationWarning={true}>
        <NextIntlClientProvider>
          <LayoutProviderWrapper>
            <ThemeProvider>{children}</ThemeProvider>
          </LayoutProviderWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
