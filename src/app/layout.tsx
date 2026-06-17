import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sangli Ceramica | Luxury Tiles & Bath Fittings Showroom",
  description: "Explore premium tiles, sanitary ware, faucets, bath fittings, and interior solutions at Sangli Ceramica - the finest showroom in Maharashtra, India.",
  keywords: ["Tiles Showroom Sangli", "Luxury Bath Fittings Maharashtra", "Sanitary ware", "Kajaria tiles", "Jaquar fittings", "Interior solutions Sangli"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} dark h-full antialiased`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-[#c5a880] selection:text-[#09090b]">
        {children}
      </body>
    </html>
  );
}
