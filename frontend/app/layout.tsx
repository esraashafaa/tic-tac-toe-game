import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tic Tac Toe Game",
  description: "A modern Tic Tac Toe game with online multiplayer functionality",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="rtl">
      <head>
        <meta name="csrf-token" content="CSRF_TOKEN_PLACEHOLDER" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          {children}
        </div>
      </body>
    </html>
  );
}
