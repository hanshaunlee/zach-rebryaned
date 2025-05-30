"use client"

import React from "react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export interface FiltersState {
  categories: string[]
  priceRange: [number, number]
  experienceLevels: string[]
  availabilityOptions: string[]
}

interface MarketplaceFiltersProps {
  onFilterChange: (filters: FiltersState) => void
  initialFilters: FiltersState
}

export default function MarketplaceFilters({ onFilterChange, initialFilters }: MarketplaceFiltersProps) {
  const [currentFilters, setCurrentFilters] = React.useState<FiltersState>(initialFilters)

  const categories = [
    { id: "ai-ml", label: "AI & Machine Learning" },
    { id: "web-dev", label: "Web Development" },
    { id: "mobile-dev", label: "Mobile Development" },
    { id: "cybersecurity", label: "Cybersecurity" },
    { id: "data-science", label: "Data Science" },
    { id: "ux-ui", label: "UX/UI Design" },
    { id: "marketing", label: "Digital Marketing" },
  ]

  const experienceLevels = [
    { id: "entry", label: "Entry Level (0-2 years)" },
    { id: "mid", label: "Mid Level (3-5 years)" },
    { id: "senior", label: "Senior Level (6-10 years)" },
    { id: "expert", label: "Expert (10+ years)" },
  ]

  const availabilityOptions = [
    { id: "now", label: "Available Now" },
    { id: "next-week", label: "Next Week" },
    { id: "next-month", label: "Next Month" },
  ]

  return (
    <div className="space-y-6 sticky top-20">
      {" "}
      {/* Added sticky positioning */}
      <h3 className="text-xl font-semibold">Filters</h3>
      <Accordion type="multiple" defaultValue={["category", "price", "experience"]} className="w-full">
        <AccordionItem value="category">
          <AccordionTrigger className="text-base font-medium">Category</AccordionTrigger>
          <AccordionContent className="space-y-2 pt-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`cat-${category.id}`}
                  checked={currentFilters.categories.includes(category.id)}
                  onCheckedChange={(checked) => {
                    setCurrentFilters((prev) => ({
                      ...prev,
                      categories: checked
                        ? [...prev.categories, category.id]
                        : prev.categories.filter((c) => c !== category.id),
                    }))
                  }}
                />
                <Label htmlFor={`cat-${category.id}`} className="font-normal text-sm">
                  {category.label}
                </Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger className="text-base font-medium">Price Range (/hr)</AccordionTrigger>
          <AccordionContent className="pt-4">
            <Slider
              defaultValue={[currentFilters.priceRange[0]]} // Assuming single thumb for simplicity, or use two thumbs if needed
              min={0}
              max={1000}
              step={10}
              value={[currentFilters.priceRange[0], currentFilters.priceRange[1]]}
              onValueChange={(value) =>
                setCurrentFilters((prev) => ({ ...prev, priceRange: value as [number, number] }))
              }
              className="mb-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>${currentFilters.priceRange[0]}</span>
              <span>${currentFilters.priceRange[1]}</span>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="experience">
          <AccordionTrigger className="text-base font-medium">Experience Level</AccordionTrigger>
          <AccordionContent className="space-y-2 pt-2">
            {experienceLevels.map((level) => (
              <div key={level.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`exp-${level.id}`}
                  checked={currentFilters.experienceLevels.includes(level.id)}
                  onCheckedChange={(checked) => {
                    setCurrentFilters((prev) => ({
                      ...prev,
                      experienceLevels: checked
                        ? [...prev.experienceLevels, level.id]
                        : prev.experienceLevels.filter((e) => e !== level.id),
                    }))
                  }}
                />
                <Label htmlFor={`exp-${level.id}`} className="font-normal text-sm">
                  {level.label}
                </Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="availability">
          <AccordionTrigger className="text-base font-medium">Availability</AccordionTrigger>
          <AccordionContent className="space-y-2 pt-2">
            {availabilityOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`avail-${option.id}`}
                  checked={currentFilters.availabilityOptions.includes(option.id)}
                  onCheckedChange={(checked) => {
                    setCurrentFilters((prev) => ({
                      ...prev,
                      availabilityOptions: checked
                        ? [...prev.availabilityOptions, option.id]
                        : prev.availabilityOptions.filter((a) => a !== option.id),
                    }))
                  }}
                />
                <Label htmlFor={`avail-${option.id}`} className="font-normal text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Button className="w-full" onClick={() => onFilterChange(currentFilters)}>
        Apply Filters
      </Button>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          const clearedFilters: FiltersState = {
            categories: [],
            priceRange: [0, 1000], // Reset to full range or initial default
            experienceLevels: [],
            availabilityOptions: [],
          }
          setCurrentFilters(clearedFilters)
          onFilterChange(clearedFilters)
        }}
      >
        Clear Filters
      </Button>
    </div>
  )
}
