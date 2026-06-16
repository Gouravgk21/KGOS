import type { Metadata, Viewport } from "next";
import { Inter, Cinzel, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/layout/ClientShell";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KGOS X INFINITY — Kumar Gourav Operating System",
  description:
    "The world's most advanced personal enterprise platform — unifying Founder Intelligence, Food Science, Research, Exam Preparation, Brand Building, and Knowledge Management for Kumar Gourav.",
  keywords: [
    "KGOS",
    "Kumar Gourav",
    "Aqua Colloids",
    "Food Science",
    "Hydrocolloid",
    "Founder OS",
    "Enterprise Dashboard",
  ],
  authors: [{ name: "Kumar Gourav" }],
  creator: "Kumar Gourav",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KGOS X INFINITY",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B1220",
};

const isMockClerk =
  !process.env.CLERK_SECRET_KEY ||
  process.env.CLERK_SECRET_KEY.includes("sk_test_clerk-secret-key-2031") ||
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes(
    "pk_test_Y2xlcmstdGVzdC"
  );

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const htmlClass = `${inter.variable} ${cinzel.variable} ${jetbrainsMono.variable} h-full antialiased`;

  if (isMockClerk) {
    return (
      <html lang="en" className={htmlClass}>
        <body className="h-full font-sans overflow-hidden" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
          <a href="#main-content" className="skip-nav">Skip to main content</a>
          <ClientShell>{children}</ClientShell>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider>
      <html lang="en" className={htmlClass}>
        <body className="h-full font-sans overflow-hidden" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
          <a href="#main-content" className="skip-nav">Skip to main content</a>
          <ClientShell>{children}</ClientShell>
        </body>
      </html>
    </ClerkProvider>
  );
}
