import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NextAuth App - Secure Authentication",
  description: "A modern authentication app built with Next.js, Auth.js v5, and Prisma",
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
