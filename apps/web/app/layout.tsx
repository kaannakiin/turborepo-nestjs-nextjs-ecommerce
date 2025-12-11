import "@blocknote/mantine/blocknoteStyles.css";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { ReactNode } from "react";
import LayoutProviderWrapper from "./components/LayoutProviderWrapper";
import "./globals.css";
import ThemeProvider from "./context/theme-context/ThemeContext";

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
        <LayoutProviderWrapper>
          <ThemeProvider>{children}</ThemeProvider>
        </LayoutProviderWrapper>
      </body>
    </html>
  );
}
