import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { cn } from "@/lib/utils";


const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'Poetry — Беларускія творы',
  description: 'Беларускія творы ад талендавых аўтараў пад любы настрой і тэму',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="be" className={cn("font-sans")}>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

