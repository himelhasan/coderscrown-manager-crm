import { ThemeProvider } from '@/components/providers/ThemeProvider';
import ToasterProvider from '@/components/providers/ToasterProvider';
import Sidebar from '@/components/Sidebar';
import { AuthProvider } from '@/context/AuthContext';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CODERSCROWN CRM',
  description: 'N8N Integrated CRM for Agencies',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} h-screen max-h-screen flex bg-background text-foreground overflow-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ToasterProvider />
              <Sidebar />
              <main className="flex-1 overflow-auto p-8 relative">
                 {/* Background Grid/Effect could go here */}
                 <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                 <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
                 {children}
              </main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
