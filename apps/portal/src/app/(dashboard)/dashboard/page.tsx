'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-black">Dashboard</h1>
      
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link 
          href="/apps/image-generator"
          className="group relative rounded-lg border bg-white p-4 sm:p-6 hover:border-black hover:shadow-lg transition-all"
        >
          <h3 className="font-semibold leading-none tracking-tight text-black mb-2">
            Image Generator
          </h3>
          <p className="text-sm text-gray-800">
            Create and manipulate images using AI
          </p>
          <span className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100 text-black">
            →
          </span>
        </Link>

        <div className="rounded-lg border bg-white p-4 sm:p-6 opacity-50">
          <h3 className="font-semibold leading-none tracking-tight text-black mb-2">
            Coming Soon
          </h3>
          <p className="text-sm text-gray-800">
            More tools are on the way
          </p>
        </div>

        <div className="rounded-lg border bg-white p-4 sm:p-6 opacity-50">
          <h3 className="font-semibold leading-none tracking-tight text-black mb-2">
            Coming Soon
          </h3>
          <p className="text-sm text-gray-800">
            More tools are on the way
          </p>
        </div>
      </div>

      <div className="mt-12 sm:mt-16">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-black">Account Settings</h2>
        <div className="rounded-lg border bg-white p-4 sm:p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-black">Name</label>
              <p className="mt-1 text-gray-800">{session?.user?.name || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-black">Email</label>
              <p className="mt-1 text-gray-800">{session?.user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 