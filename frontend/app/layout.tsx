import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Silkscreen } from "next/font/google";
import LoadingScreen from "@/components/ui/LoadingScreen";
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
  description: "The complete AI-powered digital media protection and deepfake forensics platform. Establishing provenance, creating Media DNA, detecting synthetic manipulation, and assisting takedowns.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" }
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "ARGOS AI — Digital Media Protection & Forensics",
    description: "Protect authentic media. Detect manipulation. Track suspicious derivatives. Take action.",
    type: "website",
    siteName: "ARGOS AI"
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
      <body className="min-h-screen flex flex-col bg-[#F8E8E8] text-[#111111] selection:bg-[#F4CD3F]">
        <LoadingScreen />
        {children}
      </body>
    </html>
  );
}
