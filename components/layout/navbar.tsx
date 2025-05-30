"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MenuIcon } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import Image from "next/image"
import { SignInButton } from "@/components/auth-components" // Import SignInButton

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/marketplace", label: "Marketplace" },
    { href: "/about", label: "About" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <Image src="/logo.png" alt="B-Connected Logo" width={28} height={28} className="h-7 w-7" />
          <span className="font-bold text-lg">B-Connected</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
              prefetch={false}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <Button asChild variant="default" className="hidden sm:flex">
            {" "}
            {/* Hide on very small screens if needed */}
            <Link href="/chat">Request an Expert</Link>
          </Button>
          <SignInButton /> {/* Add SignInButton here */}
        </div>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon">
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="grid gap-4 py-6">
              <Link
                href="/"
                className="flex items-center gap-2 mb-4"
                prefetch={false}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Image src="/logo.png" alt="B-Connected Logo" width={28} height={28} className="h-7 w-7" />
                <span className="font-bold text-lg">B-Connected</span>
              </Link>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                  prefetch={false}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Button asChild variant="default" className="mt-4" onClick={() => setIsMobileMenuOpen(false)}>
                <Link href="/chat">Request an Expert</Link>
              </Button>
              <div className="mt-4 border-t pt-4">
                <SignInButton /> {/* Add SignInButton in mobile menu too */}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
