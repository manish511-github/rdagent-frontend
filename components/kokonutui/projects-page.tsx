"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Filter, Grid3X3, List, Plus, Search, SlidersHorizontal } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Layout from "@/components/kokonutui/layout"

// Sample project data
const projects = [
  {
    id: "1",
    title: "Marketing Campaign",
    description: "Q4 product launch campaign planning and execution",
    status: "In Progress",
    progress: 65,
    dueDate: "2023-11-15",
    team: [
      { name: "Alex Johnson", avatar: "/abstract-letter-aj.png", initials: "AJ" },
      { name: "Morgan Garcia", avatar: "/abstract-geometric-mg.png", initials: "MG" },
      { name: "Dana Kim", avatar: "/abstract-geometric-dk.png", initials: "DK" },
    ],
    tags: ["marketing", "campaign", "product-launch"],
    image: "/marketing-campaign-brainstorm.png",
  },
  {
    id: "2",
    title: "Website Redesign",
    description: "Complete overhaul of company website with new branding",
    status: "Planning",
    progress: 25,
    dueDate: "2023-12-20",
    team: [
      { name: "Sam Chen", avatar: "/stylized-initials-sc.png", initials: "SC" },
      { name: "Alex Johnson", avatar: "/abstract-letter-aj.png", initials: "AJ" },
      { name: "Liam Williams", avatar: "/abstract-lw.png", initials: "LW" },
    ],
    tags: ["design", "website", "branding"],
    image: "/website-design-concept.png",
  },
  {
    id: "3",
    title: "Product Launch",
    description: "New product line introduction to market",
    status: "Completed",
    progress: 100,
    dueDate: "2023-10-05",
    team: [
      { name: "Morgan Garcia", avatar: "/abstract-geometric-mg.png", initials: "MG" },
      { name: "Riley Smith", avatar: "/abstract-rs.png", initials: "RS" },
      { name: "Taylor Adams", avatar: "/ta-symbol.png", initials: "TA" },
    ],
    tags: ["product", "launch", "marketing"],
    image: "/product-launch-excitement.png",
  },
  {
    id: "4",
    title: "Social Media Strategy",
    description: "Develop comprehensive social media plan for Q1",
    status: "In Progress",
    progress: 40,
    dueDate: "2023-11-30",
    team: [
      { name: "Jordan Lee", avatar: "/stylized-jl-logo.png", initials: "JL" },
      { name: "Dana Kim", avatar: "/abstract-geometric-dk.png", initials: "DK" },
      { name: "Morgan Garcia", avatar: "/abstract-geometric-mg.png", initials: "MG" },
    ],
    tags: ["social-media", "strategy", "content"],
    image: "/interconnected-social-media.png",
  },
  {
    id: "5",
    title: "Brand Guidelines",
    description: "Create comprehensive brand style guide and assets",
    status: "Review",
    progress: 85,
    dueDate: "2023-11-10",
    team: [
      { name: "Sam Chen", avatar: "/stylized-initials-sc.png", initials: "SC" },
      { name: "Morgan Bailey", avatar: "/monogram-mb.png", initials: "MB" },
      { name: "Riley Smith", avatar: "/abstract-rs.png", initials: "RS" },
    ],
    tags: ["branding", "design", "guidelines"],
    image: "/brand-guidelines-concept.png",
  },
]

export default function ProjectsPage() {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) => project.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage and organize your marketing projects</p>
          </div>
          <Button className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Search projects..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="mr-2 h-3.5 w-3.5" />
                  Filter
                  <ChevronDown className="ml-2 h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>All Projects</DropdownMenuItem>
                <DropdownMenuItem>In Progress</DropdownMenuItem>
                <DropdownMenuItem>Completed</DropdownMenuItem>
                <DropdownMenuItem>Planning</DropdownMenuItem>
                <DropdownMenuItem>Review</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
                  Sort
                  <ChevronDown className="ml-2 h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Newest</DropdownMenuItem>
                <DropdownMenuItem>Oldest</DropdownMenuItem>
                <DropdownMenuItem>Name (A-Z)</DropdownMenuItem>
                <DropdownMenuItem>Name (Z-A)</DropdownMenuItem>
                <DropdownMenuItem>Due Date</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center rounded-md border border-gray-200 dark:border-gray-800">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-none rounded-l-md ${view === "grid" ? "bg-gray-100 dark:bg-gray-800" : ""}`}
                onClick={() => setView("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
                <span className="sr-only">Grid view</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-none rounded-r-md ${view === "list" ? "bg-gray-100 dark:bg-gray-800" : ""}`}
                onClick={() => setView("list")}
              >
                <List className="h-4 w-4" />
                <span className="sr-only">List view</span>
              </Button>
            </div>
          </div>
        </div>

        {view === "grid" ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Link href={`/projects/${project.id}`} key={project.id} className="block">
                <Card className="h-full overflow-hidden transition-all hover:shadow-md">
                  <div className="aspect-video w-full overflow-hidden">
                    <Image
                      src={project.image || "/placeholder.svg"}
                      alt={project.title}
                      width={400}
                      height={225}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <CardHeader className="p-4">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <Badge
                        variant={
                          project.status === "Completed"
                            ? "default"
                            : project.status === "In Progress"
                              ? "secondary"
                              : project.status === "Review"
                                ? "outline"
                                : "destructive"
                        }
                        className="ml-2 text-xs"
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2 text-xs">{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {project.team.map((member) => (
                          <Avatar key={member.name} className="h-6 w-6 border-2 border-background">
                            <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                            <AvatarFallback className="text-[10px]">{member.initials}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Due {new Date(project.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <div className="h-full bg-primary" style={{ width: `${project.progress}%` }} />
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <Link href={`/projects/${project.id}`} key={project.id} className="block">
                <Card className="overflow-hidden transition-all hover:shadow-md">
                  <div className="flex flex-col md:flex-row">
                    <div className="aspect-video w-full md:w-48 overflow-hidden">
                      <Image
                        src={project.image || "/placeholder.svg"}
                        alt={project.title}
                        width={200}
                        height={112}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold">{project.title}</h3>
                        <Badge
                          variant={
                            project.status === "Completed"
                              ? "default"
                              : project.status === "In Progress"
                                ? "secondary"
                                : project.status === "Review"
                                  ? "outline"
                                  : "destructive"
                          }
                          className="ml-2 text-xs"
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {project.team.map((member) => (
                            <Avatar key={member.name} className="h-6 w-6 border-2 border-background">
                              <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                              <AvatarFallback className="text-[10px]">{member.initials}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Due {new Date(project.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <div className="h-full bg-primary" style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
