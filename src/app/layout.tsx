import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "India Salary Rank — Where do you stand?",
  description:
    "Find your percentile among India's salaried employees. Based on official PLFS 2023-24 data from MoSPI, Govt. of India.",
  keywords: [
    "India salary comparison",
    "salary percentile India",
    "PLFS wage data",
    "average salary India",
    "salary rank India",
  ],
  openGraph: {
    title: "India Salary Rank — Where do you stand?",
    description:
      "Find your percentile among India's salaried employees. Based on official PLFS 2023-24 data.",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "India Salary Rank — Where do you stand?",
    description:
      "Find your percentile among India's salaried employees. Based on official government data.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased noise">{children}</body>
    </html>
  );
}
