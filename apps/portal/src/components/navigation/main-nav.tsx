'use client';

import Link from 'next/link'
import Image from 'next/image'
import { signOut, useSession } from "next-auth/react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { cn } from '@/lib/utils'

const apps = [
  {
    title: "Image Generator",
    href: "/apps/image-generator",
    description: "Create and manipulate images using AI technology."
  },
  {
    title: "App 2",
    href: "/apps/app2",
    description: "Coming soon..."
  },
  {
    title: "App 3",
    href: "/apps/app3",
    description: "Coming soon..."
  }
]

export function MainNav() {
  const { data: session } = useSession();

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link href="/" className="mr-6">
          <Image
            src="/jgeneration.svg"
            alt="JGeneration"
            width={40}
            height={40}
            className="h-10 w-10"
          />
        </Link>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Apps</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  {apps.map((app) => (
                    <li key={app.href} className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          href={app.href}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none text-black">{app.title}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-gray-800">
                            {app.description}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/pricing" legacyBehavior passHref>
                <NavigationMenuLink className={cn(
                  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                )}>
                  Pricing
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="ml-auto flex items-center space-x-4">
          {session?.user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-800">
                {session.user.name || session.user.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-gray-800 hover:text-black"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm text-gray-800 hover:text-black"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  )
} 