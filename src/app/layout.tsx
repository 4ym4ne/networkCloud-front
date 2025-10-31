import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Removed Header import to avoid rendering landing header on all routes
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/features/auth/client";
import { NotificationsProvider } from "@/features/notifications";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Network Cloud",
    description: "Secure portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SessionProvider>
                <NotificationsProvider>
                    {/* Removed global <Header /> to prevent it from appearing on dashboard and app sections */}
                    <main className="min-h-screen">{children}</main>
                    <Toaster />
                </NotificationsProvider>
            </SessionProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
