import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const titleFont = localFont({
  src: "./fonts/Kalam-Bold.ttf",
  variable: "--font-tv-title",
  weight: "700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TV Trivia",
  description:
    "Free Friends and Bob’s Burgers trivia with local question banks, Classic and Endless modes, and a challenge for every rewatch.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={titleFont.variable}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
