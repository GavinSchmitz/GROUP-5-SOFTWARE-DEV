import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { SessionProvider } from "@/components/auth/session-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
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
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 font-sans">
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
