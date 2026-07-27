import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import WishlistToast from "./components/WishlistToast";
import GlobalLoader from "./components/GlobalLoader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Runr Properties | Buy, Rent & Invest in Real Estate",
  description: "Gujarat's trusted real estate platform. Browse verified properties for sale and rent across Ahmedabad, Surat, Vadodara, Rajkot, Gandhinagar.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body suppressHydrationWarning>
        <AuthProvider>
          <WishlistProvider>
            <Suspense fallback={null}><GlobalLoader /></Suspense>
            {children}
            <WishlistToast />
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
