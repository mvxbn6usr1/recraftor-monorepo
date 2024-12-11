import Link from "next/link";
import Image from "next/image";
import { RootLayout } from "@/components/layout/root-layout";

export default function Home() {
  return (
    <RootLayout>
      <section className="bg-white px-4 py-12">
        <div className="mx-auto max-w-7xl text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/jgen_title.svg"
              alt="JGeneration"
              width={384}
              height={384}
              className="h-[384px] w-auto"
              priority
            />
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-800">
            Access a powerful collection of AI tools for image generation, manipulation, and more.
            Built for creators, designers, and developers.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/register"
              className="rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
            >
              Start Creating
            </Link>
            <Link
              href="/pricing"
              className="rounded-md border border-gray-300 px-6 py-3 text-sm font-medium text-black hover:bg-gray-50"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold text-black">Our Tools</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-black">Image Generator</h3>
              <p className="mt-2 text-gray-800">
                Create stunning AI-generated images with our powerful image generation tool.
              </p>
            </div>
            <div className="rounded-lg border bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-black">Coming Soon</h3>
              <p className="mt-2 text-gray-800">
                More exciting tools are on the way. Stay tuned!
              </p>
            </div>
            <div className="rounded-lg border bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-black">Coming Soon</h3>
              <p className="mt-2 text-gray-800">
                More exciting tools are on the way. Stay tuned!
              </p>
            </div>
          </div>
        </div>
      </section>
    </RootLayout>
  );
}
