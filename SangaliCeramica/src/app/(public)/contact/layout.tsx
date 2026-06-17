import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us & Showroom Locations | Sangli Ceramica',
  description: 'Get in touch with Sangli Ceramica. Find our showroom coordinates, direct phone numbers, and working hours for premium tile inquiries.',
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
