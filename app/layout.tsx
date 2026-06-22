import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "BAOMI Dimsum | Dimsum Mentai Torch Surabaya",
  description:
    "BAOMI Dimsum menyediakan dimsum mentai torch, chili oil, dan open order batch untuk area Surabaya dan sekitar Universitas Airlangga.",
  keywords: [
    "baomi dimsum",
    "dimsum mentai surabaya",
    "dimsum torch surabaya",
    "dimsum unair",
    "dimsum kampus b",
    "dimsum kampus c",
  ],
  openGraph: {
    title: "BAOMI Dimsum | Dimsum Mentai Torch Surabaya",
    description:
      "Dimsum mentai torch dengan chili oil. Open order batch untuk area Surabaya dan sekitar Universitas Airlangga.",
    url: "https://baomidimsum.web.id",
    siteName: "BAOMI Dimsum",
    images: [
      {
        url: "https://baomidimsum.web.id/dimsum6pcs.webp",
        width: 1200,
        height: 630,
        alt: "Dimsum Mentai Torch BAOMI",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}


