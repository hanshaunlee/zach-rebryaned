"use client"

import { useChat, type Message } from "ai/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PaperclipIcon, SendIcon, UserIcon, BotIcon, Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"
import ChatExpertCard, { type ChatExpert } from "@/components/chat-expert-card" // Import the new card

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, append } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "initial-bot-1",
        role: "assistant",
        content: "Hello! How can I help you find an expert today?",
      },
      {
        id: "initial-bot-2",
        role: "assistant",
        content:
          "Tell me about your project or the expertise you're looking for. For example, 'I need a Python developer with experience in financial modeling.'",
      },
    ],
    // experimental_onToolCall: (toolCallPayload) => {
    //   // This is an optional handler if you want to intercept tool calls on the client-side
    //   // For now, we'll let the server handle execution.
    //   console.log("Client received tool call:", toolCallPayload);
    //   return true; // return true to allow the tool call to proceed
    // }
  })

  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages])

  return (
    <div className="container py-8 md:py-12 h-[calc(100vh-8rem)] flex flex-col">
      <h1 className="text-3xl font-bold mb-6 text-center">How can we help today?</h1>
      <div className="flex-grow flex flex-col border rounded-lg shadow-lg overflow-hidden bg-background">
        <ScrollArea className="flex-grow p-4 md:p-6 space-y-4" ref={scrollAreaRef}>
          {messages.map((m: Message) => (
            <div
              key={m.id}
              className={cn(
                "flex items-end gap-3 max-w-[90%] sm:max-w-[80%]", // Adjusted max width
                m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto",
              )}
            >
              <Avatar className="h-8 w-8 border self-start">
                <AvatarImage src={m.role === "assistant" ? "/logo.png" : undefined} />
                <AvatarFallback>{m.role === "user" ? <UserIcon size={18} /> : <BotIcon size={18} />}</AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "p-3 rounded-lg shadow-sm",
                  m.role === "user" ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none",
                )}
              >
                {m.role === "assistant" &&
                  m.toolInvocations?.map((toolInvocation) => {
                    if (toolInvocation.toolName === "findExperts") {
                      // The AI SDK automatically calls the tool and appends a message with role: 'tool'
                      // containing the result. We'll render the result from that message.
                      // This part is mostly for showing the "thinking" step if needed.
                      // For now, we'll primarily render the content from the assistant's message that includes the tool result.
                      const toolResult = toolInvocation.result as ChatExpert[] | undefined
                      if (toolResult && toolResult.length > 0) {
                        return (
                          <div key={toolInvocation.toolCallId} className="my-2">
                            <p className="text-sm font-medium mb-2">Here are some experts I found:</p>
                            <div className="flex flex-col gap-2 items-start">
                              {toolResult.map((expert) => (
                                <ChatExpertCard key={expert.id} expert={expert} />
                              ))}
                            </div>
                          </div>
                        )
                      } else if (toolResult) {
                        return (
                          <p key={toolInvocation.toolCallId} className="text-sm italic">
                            No specific experts found with that criteria. Try broadening your search.
                          </p>
                        )
                      }
                    }
                    return null
                  })}
                {m.content && <p className="text-sm whitespace-pre-wrap">{m.content}</p>}
              </div>
            </div>
          ))}
          {isLoading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
            <div className="flex items-end gap-3 max-w-[85%] sm:max-w-[75%] mr-auto">
              <Avatar className="h-8 w-8 border self-start">
                <AvatarImage src="/logo.png" />
                <AvatarFallback>
                  <BotIcon size={18} />
                </AvatarFallback>
              </Avatar>
              <div className="p-3 rounded-lg shadow-sm bg-muted rounded-bl-none">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </ScrollArea>
        {error && (
          <div className="p-4 border-t text-red-600 text-sm">
            <p>Error: {error.message}</p>
          </div>
        )}
        <div className="border-t p-4 bg-background/80 backdrop-blur">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground" type="button">
              <PaperclipIcon className="h-5 w-5" />
              <span className="sr-only">Attach file</span>
            </Button>
            <Input
              placeholder="Describe your needs or ask a question..."
              className="flex-grow"
              value={input}
              onChange={handleInputChange}
              aria-label="Chat input"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendIcon className="h-5 w-5" />}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
