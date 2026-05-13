import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'Brightboard — Beautiful classroom resources in minutes',
  description: 'Create curriculum-aligned slides, infographics, and lesson plans designed for Foundation classrooms.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} h-full`}>
      <body className="min-h-full bg-amber-50 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
