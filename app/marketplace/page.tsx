"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import ExpertCard from "@/components/expert-card"
import MarketplaceFilters, { type FiltersState } from "@/components/marketplace-filters"
import { SearchIcon, ListFilterIcon } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"
import { getAllExperts } from "@/lib/expert-data"

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const expertsPerPage = 8

  const allExperts = getAllExperts()

  const initialFiltersState: FiltersState = {
    categories: [],
    priceRange: [0, 1000], // Default full range
    experienceLevels: [],
    availabilityOptions: [],
  }
  const [activeFilters, setActiveFilters] = useState<FiltersState>(initialFiltersState)

  // Basic filtering logic (can be expanded)
  const filteredExperts = allExperts.filter((expert) => {
    let matchesSearch = true
    if (searchTerm) {
      matchesSearch =
        expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    let matchesCategory = true
    if (activeFilters.categories.length > 0) {
      // This requires categories to be part of the Expert data, e.g., expert.category_id
      // For now, let's assume tags can act as categories for simplicity or add a category field to Expert
      matchesCategory = activeFilters.categories.some((catId) =>
        expert.tags.map((t) => t.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")).includes(catId),
      )
    }

    let matchesPrice = true
    const expertRate = Number.parseInt(expert.rate.replace("$", "").replace("/hr", ""))
    if (!isNaN(expertRate)) {
      matchesPrice = expertRate >= activeFilters.priceRange[0] && expertRate <= activeFilters.priceRange[1]
    }

    const matchesExperience = true
    if (activeFilters.experienceLevels.length > 0) {
      // This requires parsing expert.experience, e.g., "0-2 years", "3-5 years"
      // For simplicity, this part is illustrative and needs robust parsing or structured data
      // Example: if expert.experienceYears (numeric) exists:
      // matchesExperience = activeFilters.experienceLevels.some(level => checkExperienceLevel(expert.experienceYears, level));
      // For now, we'll skip detailed experience filtering to keep it concise.
    }

    // Availability filtering would require comparing expert.availability with selected options.
    // This also needs more structured data or complex logic.

    return matchesSearch && matchesCategory && matchesPrice && matchesExperience
  })

  const totalPages = Math.ceil(filteredExperts.length / expertsPerPage)
  const currentExperts = filteredExperts.slice((currentPage - 1) * expertsPerPage, currentPage * expertsPerPage)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <>
      {/* Hero Section for Marketplace */}
      <section className="relative py-20 md:py-32 bg-muted/30">
        <Image
          src="/abstract-coastal-landscape.png"
          alt="Expert Marketplace background"
          layout="fill"
          objectFit="cover"
          className="opacity-30"
        />
        <div className="container relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Expert Marketplace</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Curious? Or maybe sure? Find an expert to talk to.
          </p>
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search by keyword, skill, or expert name..."
                className="w-full p-4 pr-12 text-lg rounded-full shadow-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search experts"
              />
              <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container py-12 md:py-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar (Desktop) */}
          <aside className="hidden md:block md:w-1/4 lg:w-1/5">
            <MarketplaceFilters onFilterChange={setActiveFilters} initialFilters={initialFiltersState} />
          </aside>

          {/* Mobile Filters Trigger */}
          <div className="md:hidden mb-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <ListFilterIcon className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <MarketplaceFilters onFilterChange={setActiveFilters} initialFilters={initialFiltersState} />
              </SheetContent>
            </Sheet>
          </div>

          {/* Experts Grid */}
          <main className="flex-1">
            {currentExperts.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentExperts.map((expert) => (
                  <ExpertCard key={expert.id} expert={expert} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No experts found matching your criteria.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          handlePageChange(currentPage - 1)
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                      />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            handlePageChange(i + 1)
                          }}
                          isActive={currentPage === i + 1}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    {/* Add Ellipsis if needed, simplified for now */}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          handlePageChange(currentPage + 1)
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  )
}
