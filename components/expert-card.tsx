import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StarIcon } from "lucide-react"

type Expert = {
  id: string
  name: string
  title: string
  rate: string
  rating: number
  reviewsCount: number
  profileImageUrl?: string
  tags: string[]
  availability: string
}

interface ExpertCardProps {
  expert: Expert
}

export default function ExpertCard({ expert }: ExpertCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={expert.profileImageUrl || "/placeholder.svg?width=300&height=200&query=professional+headshot"}
            alt={expert.name}
            layout="fill"
            objectFit="cover"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg mb-1">{expert.name}</CardTitle>
        <p className="text-sm text-muted-foreground mb-2 h-10 overflow-hidden">{expert.title}</p>
        <div className="flex items-center mb-2">
          <StarIcon className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
          <span className="text-sm font-medium">{expert.rating}</span>
          <span className="text-xs text-muted-foreground ml-1">({expert.reviewsCount} reviews)</span>
        </div>
        <p className="text-base font-semibold text-primary mb-3">{expert.rate}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {expert.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button asChild className="w-full" size="sm">
          <Link href={`/experts/${expert.id}`}>View Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
