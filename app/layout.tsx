import type { Metadata } from "next";
import { Noto_Serif, Noto_Serif_Display, Qwitcher_Grypen, Syne } from "next/font/google";
import "./globals.css";

const bodyFont = Syne({
  variable: "--font-body",
  subsets: ["latin"],
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  weight: ["300", "400", "500"],
  subsets: ["latin", "greek"],
});

const serifFont = Noto_Serif_Display({
  variable: "--font-heading",
  weight: ["300", "400", "500"],
  subsets: ["latin", "greek"],
});

const specialFont = Qwitcher_Grypen({
  variable: "--font-special",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vow",
  description: "Private modern wedding invitations.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${serifFont.variable} ${notoSerif.variable} ${specialFont.variable} h-full min-h-full bg-app-shell antialiased`}
    >
      <body className="flex min-h-full flex-col bg-app-shell font-sans">
        <div className="flex min-h-full flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
