import { RootLayout } from "@/components/layout/root-layout";
import Link from "next/link";

export default function AboutPage() {
  return (
    <RootLayout>
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-black sm:text-5xl">
              About Your Company
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-800">
              We're building the future of creative AI tools, making advanced technology accessible to everyone.
            </p>
          </div>

          <div className="mt-20">
            <div className="grid gap-12 lg:grid-cols-3">
              <div className="text-center">
                <div className="rounded-lg bg-gray-50 p-6">
                  <h3 className="mt-8 text-lg font-semibold text-black">Our Mission</h3>
                  <p className="mt-4 text-sm text-gray-800">
                    To democratize AI-powered creativity and make professional-grade tools accessible to everyone.
                  </p>
                </div>
              </div>

              <div className="text-center">
                <div className="rounded-lg bg-gray-50 p-6">
                  <h3 className="mt-8 text-lg font-semibold text-black">Our Vision</h3>
                  <p className="mt-4 text-sm text-gray-800">
                    A world where anyone can bring their creative ideas to life with the help of AI.
                  </p>
                </div>
              </div>

              <div className="text-center">
                <div className="rounded-lg bg-gray-50 p-6">
                  <h3 className="mt-8 text-lg font-semibold text-black">Our Values</h3>
                  <p className="mt-4 text-sm text-gray-800">
                    Innovation, accessibility, and ethical AI development guide everything we do.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20">
            <h2 className="text-3xl font-bold tracking-tight text-black text-center">
              Start Creating Today
            </h2>
            <div className="mt-10 flex justify-center gap-6">
              <Link
                href="/register"
                className="rounded-md bg-black px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
              >
                Get Started
              </Link>
              <Link
                href="/pricing"
                className="rounded-md border border-gray-300 px-6 py-3 text-sm font-semibold text-black hover:bg-gray-50"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </RootLayout>
  );
} 