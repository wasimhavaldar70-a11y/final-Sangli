import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book a VIP Showroom Visit | Sangli Ceramica',
  description: 'Schedule a personalized VIP visit to the Sangli Ceramica showroom. Meet our design consultants and get custom bulk discounts for commercial or home renovations.',
}

export default function BookLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
