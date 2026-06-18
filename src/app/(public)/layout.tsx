import Header from '@/components/shared/Header'
import Footer from '@/components/shared/Footer'
import WhatsAppCTA from '@/components/shared/WhatsAppCTA'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <WhatsAppCTA />
    </div>
  )
}
