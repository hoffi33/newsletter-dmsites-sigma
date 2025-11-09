import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NewsletterAI - AI Newsletter Operating System",
  description: "All-in-one AI Newsletter Operating System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
