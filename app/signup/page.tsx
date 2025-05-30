// Placeholder for signup page
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignupPage() {
  return (
    <div className="container py-16 md:py-24 flex justify-center items-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Create an account to get started with B-Connected.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground mb-6">This is a placeholder signup page.</p>
          <Button className="w-full" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
