import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CartSidebar } from "@/components/CartSidebar";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://sentinalai.com'),
  title: {
    template: '%s | Sentinal AI',
    default: 'Sentinal AI Store | Premium Electronic Components',
  },
  description: 'Shop the best electronic components online in India for DIY, embedded systems, and robotics projects. High quality, fast delivery.',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/icon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  keywords: ['electronics', 'robotics', 'arduino', 'raspberry pi', 'sensors', 'india', 'diy electronics'],
  authors: [{ name: 'Sentinal AI Team' }],
  creator: 'Sentinal AI',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://sentinalai.com',
    title: 'Sentinal AI Store | Premium Electronic Components',
    description: 'Shop the best electronic components online in India for DIY, embedded systems, and robotics projects.',
    siteName: 'Sentinal AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sentinal AI Store | Premium Electronic Components',
    description: 'Shop the best electronic components online in India for DIY, embedded systems, and robotics projects.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="antialiased bg-background text-foreground h-full flex flex-col font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <CartSidebar />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
