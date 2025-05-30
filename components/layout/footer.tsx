import Link from "next/link"
import Image from "next/image"
import { FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon, YoutubeIcon, Share2Icon } from "lucide-react"

export default function Footer() {
  const socialLinks = [
    { href: "#", icon: Share2Icon, label: "Share" },
    { href: "#", icon: FacebookIcon, label: "Facebook" },
    { href: "#", icon: TwitterIcon, label: "Twitter" },
    { href: "#", icon: InstagramIcon, label: "Instagram" },
    { href: "#", icon: LinkedinIcon, label: "LinkedIn" },
    { href: "#", icon: YoutubeIcon, label: "YouTube" },
  ]

  return (
    <footer className="border-t bg-background">
      <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <Image src="/logo.png" alt="B-Connected Logo" width={28} height={28} className="h-7 w-7" />
          <span className="font-bold text-lg">B-Connected</span>
        </Link>
        <div className="flex items-center gap-4">
          {socialLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              aria-label={link.label}
              className="text-muted-foreground hover:text-foreground"
              prefetch={false}
            >
              <link.icon className="h-5 w-5" />
            </Link>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} B-Connected. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
