"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, type FormEvent } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        redirect: false, // Handle redirect manually after checking result
        email,
        password,
        callbackUrl,
      })

      if (result?.error) {
        setError(result.error === "CredentialsSignin" ? "Invalid email or password." : result.error)
      } else if (result?.ok && result?.url) {
        // Manually redirect if signIn was successful
        window.location.href = result.url
      } else {
        // Fallback if no error but no URL (should not happen with credentials if successful)
        window.location.href = callbackUrl
      }
    } catch (err) {
      setError("An unexpected error occurred.")
      console.error("Sign in error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mb-4">
            <Image src="/logo.png" alt="B-Connected Logo" width={40} height={40} className="mx-auto" />
          </Link>
          <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
          <CardDescription>Sign in to access your B-Connected account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          {/* <div className="mt-4 text-center text-sm">
            Or sign in with
            <Button variant="link" onClick={() => signIn("github", { callbackUrl })} className="ml-1">
              GitHub
            </Button>
          </div> */}
        </CardContent>
        <CardFooter className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
