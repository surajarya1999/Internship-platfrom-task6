import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "@/components/ui/ReduxProvider";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";

export const metadata: Metadata = { title: "InternshipHub", description: "Find internships" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0f] min-h-screen flex flex-col">
        <ReduxProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ReduxProvider>
      </body>
    </html>
  );
}
