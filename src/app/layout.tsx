import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { NextUIProvider } from "@nextui-org/react";
import { Providers } from "./providers";
import CustomNavbar from "@/components/general/Navbar";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["100", "200", "300", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project Toodles",
  description: "Todas las herramientas que necesita un local comercial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {/* VIRTUAL BODY */}
          <div
            className={`${poppins.variable} font-sans grid grid-cols-12 gap-5 p-5 bg-background h-dvh text-light`}
          >
            <CustomNavbar />
            <div className="col-span-11 h-[calc(100dvh-2.5rem)] max-h-full">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
