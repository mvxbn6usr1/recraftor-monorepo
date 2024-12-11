'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/providers/auth-provider';

export function Footer() {
  const { openLogin } = useAuth();

  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/jgen_title.svg"
                alt="JGeneration"
                width={120}
                height={120}
                className="h-30 w-30"
              />
            </Link>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-300 hover:text-white">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Tools</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <button
                  onClick={openLogin}
                  className="text-gray-300 hover:text-white"
                >
                  Image Generator
                </button>
              </li>
              <li>
                <span className="text-gray-500">More Coming Soon</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Support</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="mailto:support@jgeneration.com" className="text-gray-300 hover:text-white">
                  Contact
                </a>
              </li>
              <li>
                <Link href="/docs" className="text-gray-300 hover:text-white">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} JGeneration. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 