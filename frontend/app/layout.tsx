import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Silkscreen } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const silkscreen = Silkscreen({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "ARGOS AI — Protect. Detect. Verify. Respond.",
  description: "AI-Powered Digital Media Protection & Deepfake Forensics Platform. Establishing provenance, creating Media DNA, detecting synthetic manipulation, and empowering takedown workflows.",
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${silkscreen.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[#F7F3E8] text-[#111111] selection:bg-[#F4CD3F]">
        {children}
      </body>
    </html>
  );
}
