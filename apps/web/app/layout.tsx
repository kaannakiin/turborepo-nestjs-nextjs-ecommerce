import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import LayoutProviderWrapper from "./components/LayoutProviderWrapper";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps} suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body className="relative">
        <LayoutProviderWrapper>{children}</LayoutProviderWrapper>
      </body>
    </html>
  );
}
