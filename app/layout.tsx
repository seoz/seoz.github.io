import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://seoz.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Daniel Juyung Seo — Global Technology Leader",
    template: "%s · Daniel Juyung Seo",
  },
  description:
    "The portfolio of Daniel Juyung Seo: YouTube partner engineering leader, open-source contributor, mentor, and speaker.",
  keywords: ["Daniel Juyung Seo", "YouTube", "Google", "partner engineering", "open source", "technology leadership"],
  authors: [{ name: "Daniel Juyung Seo", url: "https://www.linkedin.com/in/seoz/" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "ko_KR",
    url: "/",
    title: "Daniel Juyung Seo — Global Technology Leader",
    description: "Engineering leadership, open source, and global impact.",
    siteName: "Daniel Juyung Seo",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Daniel Juyung Seo — Engineering leadership, open source, and global impact" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daniel Juyung Seo — Global Technology Leader",
    description: "Engineering leadership, open source, and global impact.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
