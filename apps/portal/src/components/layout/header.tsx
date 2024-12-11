'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from "next-auth/react";
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface HeaderProps {
  translucent?: boolean;
}

export function Header({ translucent = false }: HeaderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { openLogin, openRegister } = useAuth();
  const isPublicPage = ['/', '/about', '/pricing'].includes(pathname);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);

  useEffect(() => {
    async function fetchTokenBalance() {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/tokens');
          const data = await response.json();
          setTokenBalance(data.balance);
        } catch (error) {
          console.error('Error fetching token balance:', error);
        }
      }
    }

    fetchTokenBalance();
    // Refresh token balance every minute
    const interval = setInterval(fetchTokenBalance, 60000);
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50",
      translucent 
        ? "bg-black/75 backdrop-blur-sm supports-[backdrop-filter]:bg-black/50"
        : "bg-black"
    )}>
      <div className="mx-auto max-w-7xl">
        <div className="flex h-16 sm:h-20 items-center justify-between px-4">
          <Link href="/" className="hover:opacity-80 flex items-center gap-2 sm:gap-4">
            <Image
              src="/jgen_title.svg"
              alt="JGeneration"
              width={64}
              height={64}
              className="h-10 w-auto sm:h-14"
            />
            <div className="hidden sm:flex flex-col">
              <span className="text-xl font-bold leading-tight text-white">JOHANNA</span>
              <span className="text-xl font-bold leading-tight text-white">GENERATION</span>
            </div>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
            {isPublicPage ? (
              <>
                <Link href="/about" className="text-sm text-gray-300 hover:text-white">
                  About
                </Link>
                <Link href="/pricing" className="text-sm text-gray-300 hover:text-white">
                  Pricing
                </Link>
                <button
                  onClick={openLogin}
                  className="text-sm text-gray-300 hover:text-white"
                >
                  Sign In
                </button>
                <button
                  onClick={openRegister}
                  className="rounded-md bg-white px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-black hover:bg-gray-100"
                >
                  Get Started
                </button>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="text-sm text-gray-300 hover:text-white">
                  Dashboard
                </Link>
                <Link href="/apps/image-generator" className="text-sm text-gray-300 hover:text-white">
                  Image Generator
                </Link>
                {session?.user && (
                  <div className="flex items-center gap-4 sm:gap-6">
                    {tokenBalance !== null && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472c.08-.185.167-.36.264-.521z" />
                        </svg>
                        <span className="text-sm font-medium text-white">{tokenBalance}</span>
                      </div>
                    )}
                    <span className="hidden sm:inline text-sm text-gray-300">
                      {session.user.name || session.user.email}
                    </span>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="text-sm text-gray-300 hover:text-white"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
} 