import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/providers/queryProvider";

export const metadata: Metadata = {
  title: 'Payment Reconciliation Dashboard',
  description: 'Bank transaction reconciliation against client contracts By Lazare Mirziashvili',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased`}>
      <body className="min-h-full flex flex-col"><QueryProvider>{children}</QueryProvider></body>
    </html>
  );
}
