import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Simplified expert type for chat card display
export type ChatExpert = {
  id: string
  name: string
  title: string
  profileImageUrl?: string
  rate: string
  skillsSummary: string
}

interface ChatExpertCardProps {
  expert: ChatExpert
}

export default function ChatExpertCard({ expert }: ChatExpertCardProps) {
  return (
    <Card className="w-full max-w-xs shadow-md my-2">
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        <Avatar className="h-12 w-12">
          <AvatarImage
            src={expert.profileImageUrl || "/placeholder.svg?width=50&height=50&query=profile"}
            alt={expert.name}
          />
          <AvatarFallback>
            {expert.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-base">{expert.name}</CardTitle>
          <p className="text-xs text-muted-foreground">{expert.title}</p>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm font-semibold text-primary mb-1">{expert.rate}</p>
        <p className="text-xs text-muted-foreground h-8 overflow-hidden">Skills: {expert.skillsSummary}</p>
      </CardContent>
      <CardFooter className="p-4 flex gap-2">
        <Button asChild size="sm" className="flex-1">
          <Link href={`/experts/${expert.id}`} target="_blank">
            View Profile
          </Link>
        </Button>
        {/* <Button variant="outline" size="sm" className="flex-1">Book Now</Button> */}
        {/* Booking directly from chat is a more complex step, for now linking to profile */}
      </CardFooter>
    </Card>
  )
}
