import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import ThemeProvider from "./(admin)/admin/(theme)/ThemeContexts/ThemeContext";
import LayoutProviderWrapper from "./components/LayoutProviderWrapper";
import "./globals.css";
import Head from "next/head";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" {...mantineHtmlProps}>
      <Head>
        <ColorSchemeScript />
      </Head>
      <body className="relative" suppressHydrationWarning={true}>
        <LayoutProviderWrapper>
          <ThemeProvider>{children}</ThemeProvider>
        </LayoutProviderWrapper>
      </body>
    </html>
  );
}
