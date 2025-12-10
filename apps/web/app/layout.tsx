import "@blocknote/mantine/blocknoteStyles.css";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import ThemeProvider from "./(admin)/admin/(theme)/ThemeContexts/ThemeContext";
import LayoutProviderWrapper from "./components/LayoutProviderWrapper";
import "./globals.css";
import { ReactNode } from "react";
import { CartProviderV3 } from "./context/cart-context/CartContextV3";

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
          <CartProviderV3>
            <ThemeProvider>{children}</ThemeProvider>
          </CartProviderV3>
        </LayoutProviderWrapper>
      </body>
    </html>
  );
}
