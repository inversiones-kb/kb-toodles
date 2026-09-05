import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "@/app/globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthProvider";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["100", "200", "300", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
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
    <html lang="en" className="dark">
      <body className="">
        <Providers>
          <Toaster
            position="bottom-right"
            richColors
            theme="light"
            toastOptions={{
              classNames: {
                default: "rounded-2xl",
              },
            }}
          />

          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
