import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BTO Explorer — Discover Singapore BTO Keywords",
  description:
    "Free keyword research tool for Singapore BTO housing. Discover what people are searching, asking, and talking about.",
  keywords: ["BTO", "Singapore", "HDB", "keyword research", "SEO", "housing"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">{children}</body>
    </html>
  );
}
