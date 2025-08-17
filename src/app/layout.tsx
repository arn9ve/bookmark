import "../styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "bookmark - Social Scraper",
  description: "Estrai contenuti da profili social",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${GeistSans.variable}`}>
      <body className="brutalist">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
