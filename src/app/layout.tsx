import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { SessionProvider } from "@/components/auth/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HourBank - Exchange Skills, Not Money",
  description:
    "A community skills-swap marketplace where you trade time-credits instead of cash. Teach guitar, fix a leaky tap, learn to code — one hour at a time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <SessionProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t bg-white py-8 text-center text-sm text-muted-foreground">
            <div className="container mx-auto px-4">
              <p>
                HourBank &copy; {new Date().getFullYear()} — Exchange skills,
                not money.
              </p>
              <p className="mt-1">
                One hour given earns one hour to spend. Everyone&apos;s time is
                equal.
              </p>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
