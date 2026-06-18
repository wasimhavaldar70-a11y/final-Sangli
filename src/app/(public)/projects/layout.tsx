import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Completed Projects Portfolio | Sangli Ceramica',
  description: 'View our portfolio of luxury villas, commercial spaces, and premium residential projects completed using Sangli Ceramica tiles and bath fittings.',
}

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
