import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The One With All the Trivia",
  description:
    "A free fan-made Friends trivia game with a local question bank, Classic and Endless modes, and a challenge for every rewatch.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
