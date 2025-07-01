import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import BgGradient from "@/components/ui/bg-gradient";
import Providers  from "@/components/providers";
import Footer from "@/components/footer";
import { Analytics } from "@vercel/analytics/next";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clipzo",
  description: "Clip videos, and extract audio from YouTube, Instagram, Reddit, Twitter, Pinterest, and many more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning={true}
      >
        <Providers>
        <BgGradient/>
        <Navbar/>
          <main className="flex-grow">{children}</main>
        <Footer/>
        <Analytics/>
        </Providers>
      </body>
    </html>
  );
}
