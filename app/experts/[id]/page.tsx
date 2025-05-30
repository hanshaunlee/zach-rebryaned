"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { StarIcon, BriefcaseIcon, MapPinIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { getExpertById, getRelatedExperts } from "@/lib/expert-data"
import { notFound } from "next/navigation"

// Import social icons from lucide-react
import { LinkedinIcon, TwitterIcon, GithubIcon, GlobeIcon } from "lucide-react"

// Helper component for star ratings
const StarRating = ({ rating, totalStars = 5 }: { rating: number; totalStars?: number }) => {
  return (
    <div className="flex items-center">
      {[...Array(totalStars)].map((_, index) => (
        <StarIcon
          key={index}
          className={`h-5 w-5 ${index < Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  )
}

import React from "react"

export default function ExpertProfilePage({ params }: { params: { id: string } }) {
  const expert = getExpertById(params.id)

  if (!expert) {
    notFound() // Or handle as a 404 page
  }

  const relatedExperts = getRelatedExperts(expert.id, 3)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    expert.availability[0] || new Date(2025, 5, 27),
  ) // Default to June 27, 2025

  const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM"] // Mock time slots

  return (
    <>
      {expert.bannerImageUrl && (
        <div className="relative w-full h-48 md:h-64 lg:h-80">
          <Image
            src={expert.bannerImageUrl || "/placeholder.svg"}
            alt={`${expert.name}'s banner`}
            layout="fill"
            objectFit="cover"
            priority
          />
        </div>
      )}
      <div className="container py-8 md:py-12 -mt-16 md:-mt-24 relative z-10">
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column: Expert Details */}
          <div className="md:col-span-2 space-y-8">
            <Card className="md:col-span-2 space-y-8 bg-background shadow-xl">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-2 border-primary">
                  <AvatarImage src={expert.profileImageUrl || "/placeholder.svg"} alt={expert.name} />
                  <AvatarFallback>
                    {expert.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold">{expert.name}</h1>
                  <p className="text-xl text-muted-foreground">{expert.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating rating={expert.rating} />
                    <span className="text-muted-foreground">({expert.reviewsCount} reviews)</span>
                  </div>
                  <p className="text-lg font-semibold text-primary">{expert.rate}</p>
                  {expert.socialLinks && (
                    <div className="flex items-center gap-3 mt-3">
                      {expert.socialLinks.linkedin && (
                        <Link
                          href={expert.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="LinkedIn"
                        >
                          <LinkedinIcon className="h-5 w-5 text-muted-foreground hover:text-primary" />
                        </Link>
                      )}
                      {expert.socialLinks.twitter && (
                        <Link
                          href={expert.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Twitter"
                        >
                          <TwitterIcon className="h-5 w-5 text-muted-foreground hover:text-primary" />
                        </Link>
                      )}
                      {expert.socialLinks.github && (
                        <Link
                          href={expert.socialLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="GitHub"
                        >
                          <GithubIcon className="h-5 w-5 text-muted-foreground hover:text-primary" />
                        </Link>
                      )}
                      {expert.socialLinks.portfolio && (
                        <Link
                          href={expert.socialLinks.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Portfolio"
                        >
                          <GlobeIcon className="h-5 w-5 text-muted-foreground hover:text-primary" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Button size="lg" className="w-full sm:w-auto">
                  Book a Session
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About {expert.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{expert.bio}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <h4 className="font-semibold mb-1">Location</h4>
                    <p className="text-muted-foreground flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      {expert.location}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Experience</h4>
                    <p className="text-muted-foreground flex items-center">
                      <BriefcaseIcon className="h-4 w-4 mr-2" />
                      {expert.experience}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-md mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {expert.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-md mb-2">Key Projects</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {expert.projects.map((project) => (
                      <li key={project.name}>
                        {project.name} <span className="text-sm">({project.company})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Latest Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {expert.latestReviews.map((review) => (
                  <div key={review.id} className="flex gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.avatar || "/placeholder.svg"} alt={review.reviewer} />
                      <AvatarFallback>
                        {review.reviewer
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{review.reviewer}</p>
                        <StarRating rating={review.rating} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View All Reviews
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Booking & Related */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Schedule a Session</CardTitle>
                <CardDescription>Select a date and time to book {expert.name}.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border p-0 mx-auto sm:mx-0" // Center on small screens if it takes full width
                  fromDate={new Date(2025, 5, 1)} // June 1st, 2025
                  toDate={new Date(2025, 6, 31)} // July 31st, 2025
                  initialFocus
                  disabled={(date) =>
                    !expert.availability.some((availableDate) => availableDate.toDateString() === date.toDateString())
                  }
                />
                {selectedDate && (
                  <div className="mt-4">
                    {" "}
                    {/* Ensure consistent margin */}
                    <h4 className="font-semibold text-md my-2 text-center sm:text-left">
                      Available Times for {selectedDate.toLocaleDateString()}:
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {" "}
                      {/* Adjust columns for time slots */}
                      {timeSlots.map((time) => (
                        <Button key={time} variant="outline">
                          {time}
                        </Button>
                      ))}
                    </div>
                    <Button className="w-full mt-4">Confirm Booking</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Related Experts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {relatedExperts.map((related) => (
                  <Link
                    key={related.id}
                    href={`/experts/${related.id}`}
                    className="block hover:bg-muted/50 p-3 rounded-md transition-colors -m-3"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={related.profileImageUrl || "/placeholder.svg"} alt={related.name} />
                        <AvatarFallback>
                          {related.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{related.name}</p>
                        <p className="text-sm text-muted-foreground">{related.title}</p>
                        <p className="text-sm font-medium text-primary">{related.rate}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
