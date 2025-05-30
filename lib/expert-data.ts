// This file acts as a simple in-memory database for experts.
// In a real application, this data would come from a database.

export type ExpertReview = {
  id: string | number
  reviewer: string
  rating: number
  comment: string
  avatar?: string
  timestamp: string
}

export type ExpertProject = {
  name: string
  company: string
  description?: string
}

export type Expert = {
  id: string
  name: string
  title: string
  pronouns?: string
  rate: string // e.g., "$475/hr"
  rating: number // Average rating
  reviewsCount: number
  bio: string
  profileImageUrl?: string
  bannerImageUrl?: string
  skills: string[]
  location: string
  experience: string // e.g., "14+ years"
  projects: ExpertProject[]
  availability: Date[] // Array of available dates
  latestReviews: ExpertReview[]
  tags: string[] // For marketplace filtering
  socialLinks?: {
    linkedin?: string
    twitter?: string
    github?: string
    portfolio?: string
  }
}

const experts: Expert[] = [
  {
    id: "ethan-yu",
    name: "Ethan Yu",
    title: "Google DeepMind Researcher",
    pronouns: "He/Him",
    rate: "$475/hr",
    rating: 4.8,
    reviewsCount: 120,
    bio: "Dr. Yu spent 8 years at Meta as a Principal AI Scientist, leading core Teams that shipped foundational models for ads and integrity. Before that, he has 14 years of experience in AI, with over 120 expert reviewed publications and patents. He has built and currently mentors dozens of AI/ML/Data Sci teams, established Meta's best practices for remote optimization, and mentoring teams in best practices. Dr. Yu's current research focuses on cutting-edge AI research, ensuring his expertise remains at the forefront of the field. His communication skills are highly rated, with a track record of delivering complex technical concepts clearly and concisely.",
    profileImageUrl: "/diverse-man-profile.png",
    bannerImageUrl: "/abstract-coastal-landscape.png",
    skills: [
      "AI Research",
      "Machine Learning",
      "Deep Learning",
      "NLP",
      "Ads Optimization",
      "Team Leadership",
      "Python",
      "TensorFlow",
      "PyTorch",
    ],
    location: "San Francisco, CA",
    experience: "14+ years",
    projects: [
      {
        name: "Foundational Models for Ads",
        company: "Meta",
        description: "Led the development of next-gen AI models for ad targeting.",
      },
      {
        name: "Integrity Systems Development",
        company: "Meta",
        description: "Built systems to detect and mitigate harmful content.",
      },
    ],
    availability: [
      new Date(2025, 5, 27),
      new Date(2025, 5, 28),
      new Date(2025, 6, 3),
      new Date(2025, 6, 5),
      new Date(2025, 6, 10),
    ],
    latestReviews: [
      {
        id: 1,
        reviewer: "Alice Smith",
        rating: 5,
        comment: "Ethan is incredibly knowledgeable and a great communicator. Highly recommend!",
        avatar: "/woman-profile.png",
        timestamp: "2025-05-15T10:30:00Z",
      },
      {
        id: 2,
        reviewer: "Bob Johnson",
        rating: 4,
        comment: "Provided valuable insights for our project. Helped us solve a critical issue.",
        avatar: "/man-profile-glasses.png",
        timestamp: "2025-05-10T14:00:00Z",
      },
    ],
    tags: ["AI", "ML", "Research", "Deep Learning", "NLP"],
    socialLinks: { linkedin: "#", twitter: "#", portfolio: "#" },
  },
  // Add more mock experts here, following the same structure
  // For brevity, I'll reuse Ethan Yu's data for other experts in the marketplace for now, but with different IDs and names.
  {
    id: "jane-doe",
    name: "Jane Doe",
    title: "Cybersecurity Analyst",
    rate: "$350/hr",
    rating: 4.5,
    reviewsCount: 85,
    profileImageUrl: "/woman-profile.png",
    bannerImageUrl: "/abstract-coastal-landscape.png",
    bio: "Jane is a seasoned cybersecurity analyst with a knack for threat detection and mitigation strategies. She has extensive experience in penetration testing and security audits.",
    skills: ["Cybersecurity", "Pentesting", "Threat Analysis", "SIEM", "Incident Response"],
    location: "New York, NY",
    experience: "8+ years",
    projects: [
      {
        name: "Enterprise Security Overhaul",
        company: "TechCorp",
        description: "Led a company-wide security infrastructure upgrade.",
      },
    ],
    availability: [new Date(2025, 6, 1), new Date(2025, 6, 2), new Date(2025, 6, 8)],
    latestReviews: [
      {
        id: 1,
        reviewer: "Carlos Ray",
        rating: 5,
        comment: "Jane's expertise was crucial for our security posture.",
        avatar: "/man-profile-beard.png",
        timestamp: "2025-05-20T11:00:00Z",
      },
    ],
    tags: ["Security", "Pentesting", "Cybersecurity"],
    socialLinks: { linkedin: "#" },
  },
  {
    id: "eamon-japhrie",
    name: "Eamon Japhrie",
    title: "Senior AI/ML Scientist @ Uber",
    rate: "$450/hr",
    rating: 4.7,
    reviewsCount: 110,
    profileImageUrl: "/man-profile-beard.png",
    bannerImageUrl: "/abstract-coastal-landscape.png",
    bio: "Eamon specializes in applying machine learning to solve complex logistical problems. His work at Uber has significantly improved efficiency in routing and demand prediction.",
    skills: ["AI", "Machine Learning", "NLP", "Logistics", "Python", "Scala"],
    location: "Austin, TX",
    experience: "10+ years",
    projects: [
      {
        name: "Dynamic Pricing Algorithm",
        company: "Uber",
        description: "Developed and deployed a new pricing model.",
      },
    ],
    availability: [new Date(2025, 6, 5), new Date(2025, 6, 6), new Date(2025, 6, 12)],
    latestReviews: [
      {
        id: 1,
        reviewer: "Priya Singh",
        rating: 5,
        comment: "Eamon's insights were game-changing for our platform.",
        avatar: "/professional-woman-profile.png",
        timestamp: "2025-05-18T09:00:00Z",
      },
    ],
    tags: ["AI", "ML", "NLP", "Logistics"],
    socialLinks: { linkedin: "#", github: "#" },
  },
  // Add more experts to make the marketplace look populated
]

// Add a few more experts by slightly modifying existing ones for variety
const additionalExpertsBase = [experts[0], experts[1], experts[2]]
for (let i = 0; i < 5; i++) {
  const baseExpert = additionalExpertsBase[i % 3]
  experts.push({
    ...baseExpert,
    id: `${baseExpert.id}-clone-${i}`,
    name: `${baseExpert.name.split(" ")[0]} Clone ${i + 1}`,
    profileImageUrl:
      i % 3 === 0
        ? "/man-profile-glasses.png"
        : i % 3 === 1
          ? "/professional-woman-profile.png"
          : "/middle-eastern-man-profile.png",
    rating: Math.round((baseExpert.rating - 0.1 + Math.random() * 0.2) * 10) / 10, // slightly vary rating
  })
}

export function getAllExperts(): Expert[] {
  return experts
}

export function getExpertById(id: string): Expert | undefined {
  return experts.find((expert) => expert.id === id)
}

export function getRelatedExperts(currentExpertId: string, count = 3): Expert[] {
  return experts
    .filter((expert) => expert.id !== currentExpertId)
    .sort(() => 0.5 - Math.random()) // Shuffle
    .slice(0, count)
}
