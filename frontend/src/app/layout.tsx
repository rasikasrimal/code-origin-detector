import type { Metadata } from "next";
import { GeistSans, GeistMono } from "geist/font";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Code Origin Detector Dashboard",
  description:
    "Visual workspace for running heuristics and models that distinguish AI-generated code from human-written code.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} ${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}