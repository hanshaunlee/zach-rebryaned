import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { CheckCircleIcon } from "lucide-react"

export default function HomePage() {
  const processSteps = [
    {
      title: "Versatile Problem Input",
      description: "Or let us know who you want to provide you, expertise.",
      imageSrc: "/placeholder.svg?width=400&height=300",
      alt: "Desk with computer and glasses",
    },
    {
      title: "Instant Matching",
      description: "We check the internet and find relevant and actionable experts.",
      imageSrc: "/placeholder.svg?width=400&height=300",
      alt: "Tablet displaying data",
    },
    {
      title: "Schedule and Book Immediately",
      description: "Book an available time for the expert right here in B-Connected.",
      imageSrc: "/placeholder.svg?width=400&height=300",
      alt: "Conference room",
    },
  ]

  const pricingPlans = [
    {
      name: "Monthly Plan",
      price: "$550",
      period: "/month",
      features: [
        "Access to all experts",
        "Unlimited searches",
        "Direct messaging",
        "Priority support",
        "Monthly analytics report",
      ],
      cta: "Get Started",
      href: "/signup?plan=monthly",
    },
    {
      name: "Yearly Plan",
      price: "$475",
      period: "/month (billed annually)",
      features: [
        "All Monthly Plan features",
        "15% discount on annual billing",
        "Early access to new features",
        "Dedicated account manager",
        "Customizable reports",
      ],
      cta: "Choose Yearly",
      href: "/signup?plan=yearly",
      popular: true,
    },
    {
      name: "Company Plan",
      price: "Contact Sales",
      period: "",
      features: [
        "All Yearly Plan features",
        "Volume discounts",
        "Custom integrations",
        "Team accounts",
        "Enterprise-grade security",
        "SLA",
      ],
      cta: "Contact Sales",
      href: "/contact-sales",
    },
  ]

  const testimonials = [
    {
      quote: "Such an empowering process as an expert. Game changing.",
      name: "Sarah Johnson",
      title: "AI Researcher, Tech Inc.",
      avatar: "/placeholder.svg?width=50&height=50",
    },
    {
      quote: "I finally feel like I'm in control of my own expert search. Yayyyy!!",
      name: "Michael Chen",
      title: "Freelance Consultant",
      avatar: "/placeholder.svg?width=50&height=50",
    },
    {
      quote: "Fast, easy, and smart - I found a genius and talked to him in one day.",
      name: "Linda Rodriguez",
      title: "Startup Founder",
      avatar: "/placeholder.svg?width=50&height=50",
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="container py-20 md:py-32 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Who you want, when you want.</h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
          Try our agent-verse to find vetted experts on demand and bundle that one pesky fee. Item fast or gain the
          market insight you need to solve your BIG problems.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/signup">Get started for free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/contact-sales">Contact Sales</Link>
          </Button>
        </div>
      </section>

      {/* Stay Tuned Section */}
      <section className="bg-foreground text-background py-16 md:py-24">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay tuned..</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Sign up for updates on new features and expert additions.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-background text-foreground placeholder:text-muted-foreground flex-grow"
              aria-label="Email for updates"
            />
            <Button type="submit" size="lg" variant="secondary">
              Sign up
            </Button>
          </form>
        </div>
      </section>

      {/* Our Process Section */}
      <section className="container py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Process</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {processSteps.map((step, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="relative h-60 w-full">
                <Image src={step.imageSrc || "/placeholder.svg"} alt={step.alt} fill style={{ objectFit: "cover" }} />
              </div>
              <CardHeader>
                <CardTitle>{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-foreground text-background py-16 md:py-24">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Flexible Plans for Every Need</h2>
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`flex flex-col ${plan.popular ? "border-primary border-2 ring-2 ring-primary shadow-xl bg-card" : "bg-card"}`}
              >
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">{plan.name}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    {plan.period && <span className="text-sm">{plan.period}</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow text-foreground">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button size="lg" className="w-full" variant={plan.popular ? "default" : "secondary"} asChild>
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Friends (Testimonials) Section */}
      <section className="container py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our friends</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-muted/40">
              <CardContent className="pt-6">
                <blockquote className="text-lg mb-4">&ldquo;{testimonial.quote}&rdquo;</blockquote>
                <div className="flex items-center gap-3">
                  <Image
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  )
}
