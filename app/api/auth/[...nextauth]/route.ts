import NextAuth, { type NextAuthOptions, type User as NextAuthUser } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
// import GithubProvider from "next-auth/providers/github"; // Keep commented or remove if not used

console.log("Loading NextAuth route handler...")
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL)
console.log("NEXTAUTH_SECRET is set:", !!process.env.NEXTAUTH_SECRET, "Length:", process.env.NEXTAUTH_SECRET?.length)
// console.log("GITHUB_ID is set:", !!process.env.GITHUB_ID); // Uncomment if using GitHub provider
// console.log("GITHUB_SECRET is set:", !!process.env.GITHUB_SECRET); // Uncomment if using GitHub provider

// Define a type for your user object if you have custom properties
interface User extends NextAuthUser {
  id: string
  // Add other custom properties like role, etc.
}

// Mock user data (replace with your actual database lookup)
const users: User[] = [
  { id: "1", name: "Test User", email: "user@example.com", image: undefined /* password: "password123" */ }, // Store hashed passwords in a real app
]

export const authOptions: NextAuthOptions = {
  // Explicitly set the secret
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    // GithubProvider({
    //   clientId: process.env.GITHUB_ID!,
    //   clientSecret: process.env.GITHUB_SECRET!,
    // }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        console.log("[NextAuth Authorize] Attempting to authorize user:", credentials?.email)
        if (!credentials?.email || !credentials.password) {
          console.log("[NextAuth Authorize] Missing email or password")
          return null // Indicates failure
        }

        try {
          // IMPORTANT: In a real application, you MUST hash passwords and compare hashes.
          // Never store or compare plain text passwords.
          const user = users.find((u) => u.email === credentials.email)

          if (user /* && user.password === credentials.password */) {
            // Replace with hash comparison
            console.log("[NextAuth Authorize] User found and password matches (mock):", user.email)
            // Return a user object that matches NextAuth's expected structure
            // Ensure it includes at least `id`, `name`, `email`.
            return { id: user.id, name: user.name, email: user.email, image: user.image }
          } else {
            console.log("[NextAuth Authorize] Invalid credentials for user:", credentials.email)
            return null // Indicates failure
          }
        } catch (error) {
          console.error("[NextAuth Authorize] Error during authorization:", error)
          return null // Indicates failure
        }
      },
    }),
  ],
  session: {
    strategy: "jwt", // Using JWT for session strategy
  },
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      // `user` is only passed on sign-in.
      if (user?.id) {
        // Check user.id as it's more reliable than just `user` object
        token.id = user.id
        // Add any other properties from the user object to the token
        // token.role = (user as User).role; // Example if you have roles
      }
      return token
    },
    async session({ session, token, user }) {
      // `user` here is the user object from the database, only available if using database sessions.
      // With JWT strategy, `token` contains the JWT payload.
      if (session.user && token.id) {
        ;(session.user as User).id = token.id as string
        // Add any other properties from the token to the session.user object
        // (session.user as User).role = token.role; // Example
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin", // Custom sign-in page
    error: "/auth/error", // Custom error page (optional, NextAuth provides a default)
    // signOut: '/auth/signout',
    // verifyRequest: '/auth/verify-request', // (used for email provider)
    // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out to disable)
  },
  // Enable debug messages in development
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, ...message) {
      console.error(`NextAuth Server Error - Code: ${code}`, ...message)
    },
    warn(code, ...message) {
      console.warn(`NextAuth Server Warning - Code: ${code}`, ...message)
    },
    debug(code, ...message) {
      // console.debug(`NextAuth Server Debug - Code: ${code}`, ...message); // Can be too verbose
    },
  },
}

let handlerInstance: any
try {
  handlerInstance = NextAuth(authOptions)
} catch (error) {
  console.error("CRITICAL: Error initializing NextAuth:", error)
  // Fallback handler or rethrow if you want the app to crash hard
  handlerInstance = (req: Request, res: Response) => {
    return new Response("Internal Server Error: NextAuth failed to initialize.", { status: 500 })
  }
}

export { handlerInstance as GET, handlerInstance as POST }
