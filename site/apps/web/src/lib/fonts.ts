import { Playpen_Sans, Source_Sans_3 } from 'next/font/google'

export const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source-sans',
  weight: ['400', '600', '700'],
  display: 'swap',
})

export const playpenSans = Playpen_Sans({
  subsets: ['latin'],
  variable: '--font-playpen-sans',
  weight: '700',
  display: 'swap',
})
