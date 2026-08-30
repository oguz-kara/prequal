import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';

// Load the ABCDiatype font (Regular and Bold only)
const abcdDiatype = localFont({
  src: [
    { path: "./fonts/ABCDiatype-Regular.otf", weight: "400" },
    { path: "./fonts/ABCDiatype-Bold.otf", weight: "700" },
  ],
  variable: "--font-abcd-diatype",
});

// Load the Reckless font (Regular and Medium only)
const reckless = localFont({
  src: [
    { path: "./fonts/RecklessTRIAL-Regular.woff2", weight: "400" },
    { path: "./fonts/RecklessTRIAL-Medium.woff2", weight: "500" },
  ],
  variable: "--font-reckless",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const geistMono = localFont({
  src: [{ path: "./fonts/GeistMonoVF.woff", weight: "100 900" }],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Prequal — AI Lead Research & ICP Scoring",
  description: "Research any company, score it against your client\u0027s ICP with Claude, and route HOT leads to your CRM.",
  openGraph: {
    title: 'Prequal',
    description: 'Instantly get detailed research insights and know everything about any company inside out.',
    images: ['https://companyresearcher.exa.ai/opengraph-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prequal',
    description: 'Instantly get detailed research insights and know everything about any company inside out.',
    images: ['https://companyresearcher.exa.ai/opengraph-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${abcdDiatype.variable} ${reckless.variable} ${inter.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}