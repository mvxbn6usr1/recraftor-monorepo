import { Header } from "./header";
import { Footer } from "./footer";

interface RootLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function RootLayout({ children, className = "" }: RootLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className={`flex-1 bg-gray-50 ${className}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
} 