import { Outfit, Space_Mono } from "next/font/google";
import "./globals.css";
import Provider from "./provider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner"

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "700"], // Outfit supports multiple weights
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"], // Space Mono only supports 400 & 700
});

export const metadata = {
  title: "BenchAI",
  description: "AI Model Benchmarking App",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${spaceMono.variable} antialiased`}
      >
        <Provider>{children}  <Toaster /> </Provider>
      </body>
    </html>
    </ClerkProvider>
  );
}
