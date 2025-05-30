import { openai } from "@ai-sdk/openai"
import { streamText, convertToCoreMessages, tool, type CoreMessage } from "ai"
import { z } from "zod"
import { getAllExperts } from "@/lib/expert-data" // Assuming Expert type is exported

export const maxDuration = 30

// Define the schema for the parameters our tool will accept
const findExpertsParameters = z.object({
  keywords: z
    .array(z.string())
    .describe("Keywords or skills the user is looking for in an expert. E.g., ['AI', 'Python', 'UX Design']"),
  minExperienceYears: z.number().optional().describe("Minimum years of experience desired."),
  maxRatePerHour: z.number().optional().describe("Maximum hourly rate the user is willing to pay."),
})

export async function POST(req: Request) {
  try {
    const { messages }: { messages: CoreMessage[] } = await req.json()

    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY is not set.")
      return new Response("OpenAI API key not configured.", { status: 500 })
    }

    const result = await streamText({
      model: openai("gpt-4o"),
      messages: convertToCoreMessages(messages),
      system: `You are a helpful assistant for B-Connected, an expert marketplace.
      Your goal is to understand the user's needs and help them find the right expert.
      If the user expresses interest in finding an expert or describes their needs, use the 'findExperts' tool to suggest relevant experts.
      Ask clarifying questions if needed to gather enough information (like keywords, skills, experience, budget) before calling the tool.
      When presenting experts, briefly mention why they might be a good fit.
      If no experts are found, inform the user gracefully and perhaps ask for different criteria.`,
      tools: {
        findExperts: tool({
          description: "Finds and suggests experts based on user criteria like skills, experience, and rate.",
          parameters: findExpertsParameters,
          execute: async ({ keywords, minExperienceYears, maxRatePerHour }) => {
            console.log("Tool 'findExperts' called with params:", { keywords, minExperienceYears, maxRatePerHour })
            let experts = getAllExperts()

            // Basic filtering logic
            if (keywords && keywords.length > 0) {
              experts = experts.filter((expert) =>
                keywords.some(
                  (keyword) =>
                    expert.name.toLowerCase().includes(keyword.toLowerCase()) ||
                    expert.title.toLowerCase().includes(keyword.toLowerCase()) ||
                    expert.skills.some((skill) => skill.toLowerCase().includes(keyword.toLowerCase())) ||
                    expert.tags.some((tag) => tag.toLowerCase().includes(keyword.toLowerCase())) ||
                    expert.bio.toLowerCase().includes(keyword.toLowerCase()),
                ),
              )
            }

            if (minExperienceYears) {
              experts = experts.filter((expert) => {
                const expNum = Number.parseInt(expert.experience.split("+")[0])
                return !isNaN(expNum) && expNum >= minExperienceYears
              })
            }

            if (maxRatePerHour) {
              experts = experts.filter((expert) => {
                const rateNum = Number.parseInt(expert.rate.replace("$", "").replace("/hr", ""))
                return !isNaN(rateNum) && rateNum <= maxRatePerHour
              })
            }

            // Return a limited number of experts, with essential info for cards
            const suggestedExperts = experts.slice(0, 3).map((expert) => ({
              id: expert.id,
              name: expert.name,
              title: expert.title,
              profileImageUrl: expert.profileImageUrl,
              rate: expert.rate,
              skillsSummary: expert.skills.slice(0, 3).join(", "), // A brief summary of skills
            }))

            console.log("Tool 'findExperts' returning:", suggestedExperts.length, "experts")
            return suggestedExperts // The AI SDK will handle serializing this
          },
        }),
      },
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in chat API:", error)
    let errorMessage = "An unexpected error occurred."
    if (error instanceof Error) {
      errorMessage = error.message
    }
    return new Response(JSON.stringify({ error: "Failed to process chat request: " + errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
