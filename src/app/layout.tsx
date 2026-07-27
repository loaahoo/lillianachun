import type { Metadata } from "next";
import { Cormorant_Garamond, Great_Vibes, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { EVENT } from "@/lib/event";

const display = Cormorant_Garamond({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});

const script = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-script",
});

const body = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: `${EVENT.title} | ${EVENT.location}`,
  description: `Celebrate ${EVENT.honoree}'s 100th birthday in ${EVENT.location}! Party details, RSVP, and a photo gallery of 100 years of aloha.`,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${script.variable} ${body.variable} min-h-screen antialiased flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
