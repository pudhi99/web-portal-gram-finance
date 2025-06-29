import './globals.css'
import type { Metadata } from 'next'
import SessionProviders from '@/components/providers/SessionProviders'
import Navbar from '@/components/shared/Navbar'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import I18nProvider from '@/components/providers/I18nProvider'
import { Toaster } from 'sonner'
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Village Lending Dashboard',
  description: 'Village Lending Operations Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            <SessionProviders>
              <Navbar />
              <main>{children}</main>
              <Toaster />
            </SessionProviders>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
