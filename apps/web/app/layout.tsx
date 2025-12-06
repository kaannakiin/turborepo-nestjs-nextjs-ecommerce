import "@blocknote/mantine/blocknoteStyles.css";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import ThemeProvider from "./(admin)/admin/(theme)/ThemeContexts/ThemeContext";
import LayoutProviderWrapper from "./components/LayoutProviderWrapper";
import "./globals.css";
import { ReactNode } from "react";

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
