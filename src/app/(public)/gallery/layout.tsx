import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inspiration Gallery | Sangli Ceramica',
  description: 'Explore high-resolution photos of our premium tiles, bathroom fixtures, and design ideas. See how Sangli Ceramica products look in real settings.',
}

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
