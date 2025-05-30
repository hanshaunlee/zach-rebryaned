import { Skeleton } from "@/components/ui/skeleton"
import { ListFilterIcon } from "lucide-react"

export default function MarketplaceLoading() {
  return (
    <>
      {/* Hero Section Skeleton */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container text-center">
          <Skeleton className="h-12 w-3/4 md:w-1/2 mx-auto mb-6" />
          <Skeleton className="h-6 w-full max-w-2xl mx-auto mb-8" />
          <div className="max-w-xl mx-auto">
            <Skeleton className="h-14 w-full rounded-full" />
          </div>
        </div>
      </section>

      {/* Main Content Area Skeleton */}
      <div className="container py-12 md:py-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar Skeleton (Desktop) */}
          <aside className="hidden md:block md:w-1/4 lg:w-1/5 space-y-6">
            <Skeleton className="h-8 w-1/2 mb-4" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
            <Skeleton className="h-10 w-full mt-4" />
            <Skeleton className="h-10 w-full mt-2" />
          </aside>

          {/* Mobile Filters Trigger Skeleton */}
          <div className="md:hidden mb-4">
            <Skeleton className="h-10 w-full flex items-center justify-center">
              <ListFilterIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Filters</span>
            </Skeleton>
          </div>

          {/* Experts Grid Skeleton */}
          <main className="flex-1">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full mt-2" />
                </div>
              ))}
            </div>
            {/* Pagination Skeleton */}
            <div className="mt-12 flex justify-center">
              <Skeleton className="h-10 w-64" />
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
