import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import Image from "next/image";
import Header from "@/components/header";
import Link from "next/link";
import HeaderSocials from "@/components/header-socials";
import UpdateDialog from "@/components/update-dialog";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vital Proxy Tester",
  description: "A simple proxy tester by Vital Proxies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="bg-gradient-to-b from-accent/30 to-background min-h-screen text-text-primary">
          <div className="mx-auto min-h-screen max-w-7xl pt-8 px-8 pb-20">
            <div className="w-full flex flex-row items-center justify-between mx-auto">
              <Header />
            </div>
            <div className="flex items-center justify-center my-6">
              <HeaderSocials />
            </div>
            <div>
              <UpdateDialog />
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
