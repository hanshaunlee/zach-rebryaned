import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// Log at the very top to see if the module itself is loading and if env vars are present
console.log("Loading NextAuth route handler...")
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL) // Should be set by Vercel or .env.local
console.log("NEXTAUTH_SECRET is set:", !!process.env.NEXTAUTH_SECRET)
// Avoid logging the actual secret value in production logs if possible,
// but for debugging, you might temporarily log a portion or its length.
// console.log("NEXTAUTH_SECRET length:", process.env.NEXTAUTH_SECRET?.length);

// In a real app, you'd validate credentials against a database.
const users = [{ id: "1", name: "Demo User", email: "user@example.com", password: "password123" }]

export const authOptions: NextAuthOptions = {
  // Explicitly set the secret to ensure it's being used.
  // NextAuth.js should pick this up from process.env.NEXTAUTH_SECRET automatically,
  // but being explicit can help rule out issues with environment variable propagation.
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // Log incoming credentials (excluding password in production logs)
        console.log("Authorize attempt for email:", credentials?.email)

        if (!credentials?.email || !credentials.password) {
          console.error("Authorize: Missing email or password in credentials.")
          return null
        }

        try {
          const user = users.find((u) => u.email === credentials.email)
          if (user && user.password === credentials.password) {
            console.log("Authorize: User found and password matched for:", user.email)
            return { id: user.id, name: user.name, email: user.email }
          }
          console.log("Authorize: User not found or password mismatch for email:", credentials.email)
          return null
        } catch (error) {
          console.error("Authorize: Error during authorization:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // console.log("JWT Callback - Token:", token, "User:", user, "Account:", account);
      if (user) {
        token.id = user.id
        // if (account?.provider === "github" && profile) { // Example if using GitHub
        //   token.githubUsername = (profile as any).login;
        // }
      }
      return token
    },
    async session({ session, token }) {
      // console.log("Session Callback - Session:", session, "Token:", token);
      if (session.user && token.id) {
        session.user.id = token.id as string
        // if (token.githubUsername) { // Example
        //   (session.user as any).githubUsername = token.githubUsername;
        // }
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, ...message) {
      // Log the full message which might contain the error object
      console.error(`NextAuth Server Error - Code: ${code}`, ...message)
    },
    warn(code, ...message) {
      console.warn(`NextAuth Server Warning - Code: ${code}`, ...message)
    },
    // debug(code, ...message) {
    //   console.debug(`NextAuth Server Debug - Code: ${code}`, ...message);
    // },
  },
}

// Wrapping the handler in a try-catch might give more insight if NextAuth() itself throws an error during instantiation
let handler
try {
  handler = NextAuth(authOptions)
} catch (error) {
  console.error("CRITICAL: Error initializing NextAuth:", error)
  // Fallback handler if NextAuth itself fails to initialize
  const fallbackHandler = () => {
    return new Response("Internal Server Error: NextAuth failed to initialize.", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    })
  }
  handler = { GET: fallbackHandler, POST: fallbackHandler }
}

export { handler as GET, handler as POST }
