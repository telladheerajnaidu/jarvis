import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "J.A.R.V.I.S. // Stark Industries Mainframe",
  description: "Authorized Access Terminal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen hud-grid">{children}</body>
    </html>
  );
}
