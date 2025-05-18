import './globals.css'
import ClientLayout from './ClientLayout';

export const metadata = {
  title: 'E-Commerce App',
  description: 'Full-Stack E-Commerce with Next.js 13 App Router',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
