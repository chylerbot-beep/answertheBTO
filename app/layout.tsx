import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BTO Answer Finder",
  description: "Discover what people are asking about Singapore BTO housing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
