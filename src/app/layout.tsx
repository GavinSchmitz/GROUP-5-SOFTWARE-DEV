import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { AuthProvider } from "@/components/auth/auth-provider";

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
        <AuthProvider>
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
              <p className="mt-3 text-xs text-muted-foreground/70">
                Photos via Openverse:{" "}
                <a
                  href="https://www.flickr.com/photos/41431665@N07"
                  className="underline"
                >
                  COD Newsroom
                </a>
                ,{" "}
                <a
                  href="https://www.flickr.com/photos/39038034@N03"
                  className="underline"
                >
                  phit2btyd
                </a>
                ,{" "}
                <a
                  href="https://www.flickr.com/photos/53326337@N00"
                  className="underline"
                >
                  quinn.anya
                </a>{" "}
                and{" "}
                <a
                  href="https://www.flickr.com/photos/9260784@N04"
                  className="underline"
                >
                  Edward Allen Lim
                </a>{" "}
                are licensed under{" "}
                <a
                  href="https://creativecommons.org/licenses/by/2.0/"
                  className="underline"
                >
                  CC BY 2.0
                </a>{" "}
                /{" "}
                <a
                  href="https://creativecommons.org/licenses/by-sa/2.0/"
                  className="underline"
                >
                  CC BY-SA 2.0
                </a>
                .
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
