import type { Metadata } from "next";
import { Manrope, Caveat, Poppins } from "next/font/google";
import "./globals.css";
import { BackgroundEffects } from "@/components/BackgroundEffects";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Asil | Product Designer",
  description: "Portfolio of Asil, a Product Designer and UX Architect.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
<body className={`${manrope.variable} ${caveat.variable} ${poppins.variable} font-sans antialiased bg-background text-foreground`}>
        <BackgroundEffects />
        {children}
      </body>
    </html>
  );
}
