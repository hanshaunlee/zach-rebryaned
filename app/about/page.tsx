"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import type React from "react"
import { useState } from "react"

export default function AboutPage() {
  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  })
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState((prevState) => ({ ...prevState, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmissionStatus("submitting")
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    // Randomly succeed or fail for demo
    if (Math.random() > 0.2) {
      setSubmissionStatus("success")
      setFormState({ fullName: "", email: "", subject: "", message: "" }) // Reset form
    } else {
      setSubmissionStatus("error")
    }
  }

  return (
    <div className="container py-12 md:py-16">
      <section className="mb-16 md:mb-24">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Founding Story</h1>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>
                We are Team Triad, the Stanford Startup Garage's Cohort of Winter 2023. Our journey began with a simple
                observation: finding and connecting with highly talented and specialized individuals was often a
                fragmented and inefficient process.
              </p>
              <p>
                Traditional platforms lacked the nuance to truly understand complex needs, and the process of vetting,
                scheduling, and payment was cumbersome. We envisioned a better way.
              </p>
              <p>
                B-Connected was born out of this vision. We are building an intelligent layer that not only connects you
                with the right experts but also streamlines the entire engagement. Our AI-powered matching, integrated
                scheduling, and transparent workflows are designed to make expertise accessible and actionable.
              </p>
              <p>
                We believe that the right connection at the right time can be transformative. B-Connected provides a
                fast, relevant, and trustworthy way to tap into a global pool of knowledge and solve your most pressing
                problems.
              </p>
            </div>
          </div>
          <div className="relative h-80 md:h-[500px] rounded-lg overflow-hidden shadow-xl">
            <Image src="/founding-story-collage.png" alt="Founding team collage" layout="fill" objectFit="cover" />
          </div>
        </div>
      </section>

      <section>
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Contact Us</CardTitle>
            <CardDescription>Have questions or want to learn more? Reach out to us.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="John Doe"
                    value={formState.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={formState.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="e.g., Partnership Inquiry"
                  value={formState.subject}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Your Message or Question</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us more..."
                  rows={5}
                  value={formState.message}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={submissionStatus === "submitting"}>
                {submissionStatus === "submitting" ? "Submitting..." : "Submit Message"}
              </Button>
              {submissionStatus === "success" && (
                <p className="text-sm text-green-600 text-center">
                  Message sent successfully! We'll get back to you soon.
                </p>
              )}
              {submissionStatus === "error" && (
                <p className="text-sm text-red-600 text-center">Something went wrong. Please try again later.</p>
              )}
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
