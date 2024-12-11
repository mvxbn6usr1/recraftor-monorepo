import { RootLayout } from "@/components/layout/root-layout";
import Link from "next/link";

export default function NotFound() {
  return (
    <RootLayout>
      <div className="bg-white min-h-[60vh] flex items-center">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <p className="text-base font-semibold text-black">404</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-black sm:text-5xl">Page not found</h1>
          <p className="mt-4 text-base text-gray-800">Sorry, we couldn't find the page you're looking for.</p>
          <div className="mt-10">
            <Link
              href="/"
              className="rounded-md bg-black px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
            >
              Go back home
            </Link>
          </div>
        </div>
      </div>
    </RootLayout>
  );
} 