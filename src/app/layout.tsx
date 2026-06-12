import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "@swayam's Objects of Interest",
  description: "A public wall of objects of interest."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
