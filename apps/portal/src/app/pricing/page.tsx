import Link from "next/link";
import { RootLayout } from "@/components/layout/root-layout";

const plans = [
  {
    name: "Hobby",
    description: "Perfect for hobbyists and occasional users",
    price: "$9",
    tokens: "100",
    features: [
      "100 tokens per month",
      "~25 standard generations",
      "User-friendly interface",
      "Community support",
      "Tokens expire monthly"
    ],
  },
  {
    name: "Creator",
    description: "Ideal for content creators and artists",
    price: "$24",
    tokens: "300",
    features: [
      "300 tokens per month",
      "~75 standard generations",
      "Advanced export options",
      "Project organization",
      "Priority support",
      "Tokens expire monthly"
    ],
  },
  {
    name: "Professional",
    description: "For professional users and small teams",
    price: "$59",
    tokens: "800",
    features: [
      "800 tokens per month",
      "~200 standard generations",
      "50% token rollover",
      "API access",
      "Team collaboration tools",
      "Advanced analytics",
      "Priority support"
    ],
  },
  {
    name: "Enterprise",
    description: "Custom solutions for large organizations",
    price: "Custom",
    tokens: "Custom",
    features: [
      "Custom token allocation",
      "Volume discounts",
      "Unlimited token rollover",
      "Dedicated support",
      "Custom API integration",
      "White-label options",
      "SLA guarantees"
    ],
  },
];

export default function PricingPage() {
  return (
    <RootLayout>
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-800">
              Get instant access to powerful AI tools with our user-friendly platform. No API setup required.
            </p>
          </div>

          {/* Token Usage Examples */}
          <div className="mt-8 text-center">
            <h3 className="text-xl font-semibold text-black mb-4">Token System</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="font-medium text-black">Raster Generation</p>
                <p className="text-gray-600">4 tokens per image</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="font-medium text-black">Vector Generation</p>
                <p className="text-gray-600">8 tokens per image</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="font-medium text-black">Style & Effects</p>
                <p className="text-gray-600">4 tokens per operation</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="font-medium text-black">Generative Upscale</p>
                <p className="text-gray-600">80 tokens per image</p>
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="rounded-lg border bg-white p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
              >
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-black">{plan.name}</h3>
                  <p className="mt-4 text-sm text-gray-800">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <p className="text-4xl font-bold text-black">{plan.price}</p>
                  <p className="mt-1 text-sm text-gray-800">per month</p>
                  <p className="mt-2 text-sm font-medium text-black">{plan.tokens} tokens/month</p>
                </div>

                <div className="flex-grow">
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex text-sm text-gray-800">
                        <svg
                          className="mr-3 h-5 w-5 flex-shrink-0 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t">
                  {plan.name === "Enterprise" ? (
                    <a
                      href="mailto:sales@yourcompany.com"
                      className="block w-full rounded-md border border-black bg-white px-4 py-2 text-center text-sm font-medium text-black hover:bg-gray-50"
                    >
                      Contact Sales
                    </a>
                  ) : (
                    <Link
                      href="/register"
                      className="block w-full rounded-md bg-black px-4 py-2 text-center text-sm font-medium text-white hover:bg-gray-800"
                    >
                      Get Started
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Additional Information */}
          <div className="mt-16 text-center">
            <h3 className="text-xl font-semibold text-black mb-4">Additional Token Packages</h3>
            <div className="grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto text-sm">
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="font-medium text-black">50 tokens</p>
                <p className="text-gray-600">$5 ($0.10 per token)</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="font-medium text-black">100 tokens</p>
                <p className="text-gray-600">$9 ($0.09 per token)</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="font-medium text-black">500 tokens</p>
                <p className="text-gray-600">$40 ($0.08 per token)</p>
              </div>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="mt-16">
            <h3 className="text-xl font-semibold text-black mb-6 text-center">Why Choose Our Platform</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="font-medium text-black">No Setup Required</p>
                <p className="text-gray-600">Start creating immediately with our intuitive interface</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="font-medium text-black">Project Management</p>
                <p className="text-gray-600">Organize and track your creations efficiently</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="font-medium text-black">Team Collaboration</p>
                <p className="text-gray-600">Work together seamlessly with shared workspaces</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="font-medium text-black">Regular Updates</p>
                <p className="text-gray-600">Access new features and improvements monthly</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RootLayout>
  );
} 