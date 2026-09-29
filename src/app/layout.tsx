import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "@/components/providers/StoreProvider";
import { ToastProvider } from "@/components/ui/toast-context";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "MyKit — Good Food. Your Way.",
  description: "A modern, high-quality restaurant online ordering and order management platform built with Next.js and MongoDB.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="flex min-h-screen flex-col bg-[#fafaf9] text-slate-900 antialiased selection:bg-orange-100 selection:text-orange-900">
        <StoreProvider>
          <ToastProvider>
            <Header />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
