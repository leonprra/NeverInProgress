import type { Metadata } from "next"
import { Space_Mono, Space_Grotesk } from "next/font/google"
import "./globals.css"
import Nav from "@/components/Nav"
import PageTransition from "@/components/PageTransition"

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
})

export const metadata: Metadata = {
  title: "LP Portfolio",
  description: "Industrial Designer & Creative Technologist",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${spaceGrotesk.variable}`}>
      <body>
        <Nav />
        <main style={{ paddingTop: 48, minHeight: "100vh" }}>
          {children}
        </main>
        <PageTransition />
      </body>
    </html>
  )
}
