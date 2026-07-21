import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Providers } from "../../providers";
import CustomNavbar from "@/components/general/Navbar";
import { Toaster } from "sonner";
import RoleGuard from "@/components/auth/RoleGuard";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["100", "200", "300", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project Toodles",
  description: "Todas las herramientas que necesita un local comercial.",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div
        /* className={`${poppins.variable} gap-5 p-5 bg-background h-dvh text-light grid grid-cols-12`} */
        className={`${poppins.variable} gap-5 p-5 bg-background h-dvh text-light flex`}
      >
        <CustomNavbar />
        <div className="flex-1 overflow-hidden w-full h-[calc(100dvh-2.5rem)] max-h-full">
          {children}
        </div>
      </div>
    </RoleGuard>
  );
}
