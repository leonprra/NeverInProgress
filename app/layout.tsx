import type { Metadata } from "next"
import { Space_Mono, Inter, Micro_5 } from "next/font/google"
import "./globals.css"
import Nav from "@/components/Nav"
import PageTransition from "@/components/PageTransition"
import { TransitionProvider, TransitionWrapper } from "@/components/TransitionContext"

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
})

const micro5 = Micro_5({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-micro-5",
  display: "swap",
})

export const metadata: Metadata = {
  title: "LP Portfolio",
  description: "Industrial Designer & Creative Technologist",
  icons: {
    icon: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${inter.variable} ${micro5.variable}`}>
      <body>
        <TransitionProvider>
          <Nav />
          <main style={{ paddingTop: 48, minHeight: "100vh" }}>
            <TransitionWrapper>
              {children}
            </TransitionWrapper>
          </main>
        </TransitionProvider>
        <PageTransition />
      </body>
    </html>
  )
}
