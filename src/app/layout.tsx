import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/layout/ClientShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "KGOS 2031 — Ultimate Founder Edition",
  description: "Kumar Gourav Operating System. Personal ERP + Business ERP + AI COO.",
  themeColor: "#07070d",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="h-full bg-black text-zinc-100 overflow-hidden">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
