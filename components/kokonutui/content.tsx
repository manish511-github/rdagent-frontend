"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Calendar,
  Clock,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  ThumbsUp,
  Trash2,
} from "lucide-react"
import Layout from "./layout"

// Sample content data
const contentData = [
  {
    id: "1",
    title: "10 Ways AI is Transforming Marketing in 2025",
    type: "Blog Post",
    status: "Published",
    author: "Sarah Johnson",
    date: "May 15, 2025",
    views: 3245,
    likes: 142,
    image: "/marketing-campaign-brainstorm.png",
  },
  {
    id: "2",
    title: "The Future of Social Media Marketing",
    type: "Whitepaper",
    status: "Draft",
    author: "Michael Chen",
    date: "May 12, 2025",
    views: 0,
    likes: 0,
    image: "/interconnected-social-media.png",
  },
  {
    id: "3",
    title: "How to Create Engaging Video Content",
    type: "Tutorial",
    status: "Published",
    author: "Emma Rodriguez",
    date: "May 10, 2025",
    views: 1876,
    likes: 87,
    image: "/creative-workflow-dashboard.png",
  },
  {
    id: "4",
    title: "Case Study: How We Increased Conversion by 45%",
    type: "Case Study",
    status: "Published",
    author: "David Kim",
    date: "May 8, 2025",
    views: 1543,
    likes: 65,
    image: "/product-launch-excitement.png",
  },
  {
    id: "5",
    title: "Email Marketing Best Practices for 2025",
    type: "Guide",
    status: "Review",
    author: "Jessica Lee",
    date: "May 5, 2025",
    views: 0,
    likes: 0,
    image: "/website-design-concept.png",
  },
  {
    id: "6",
    title: "Understanding Customer Journey Mapping",
    type: "Blog Post",
    status: "Published",
    author: "Sarah Johnson",
    date: "May 3, 2025",
    views: 982,
    likes: 34,
    image: "/brand-guidelines-concept.png",
  },
  {
    id: "7",
    title: "Social Media Content Calendar Template",
    type: "Template",
    status: "Published",
    author: "Michael Chen",
    date: "May 1, 2025",
    views: 2145,
    likes: 98,
    image: "/project-asset-concept.png",
  },
  {
    id: "8",
    title: "The Complete Guide to SEO in 2025",
    type: "Guide",
    status: "Draft",
    author: "Emma Rodriguez",
    date: "April 28, 2025",
    views: 0,
    likes: 0,
    image: "/marketing-campaign-brainstorm.png",
  },
  {
    id: "9",
    title: "How to Measure Content Marketing ROI",
    type: "Blog Post",
    status: "Published",
    author: "David Kim",
    date: "April 25, 2025",
    views: 1245,
    likes: 56,
    image: "/interconnected-social-media.png",
  },
  {
    id: "10",
    title: "Building a Brand Voice Guide",
    type: "Template",
    status: "Review",
    author: "Jessica Lee",
    date: "April 22, 2025",
    views: 0,
    likes: 0,
    image: "/creative-workflow-dashboard.png",
  },
  {
    id: "11",
    title: "Video Marketing Trends for 2025",
    type: "Blog Post",
    status: "Published",
    author: "Sarah Johnson",
    date: "April 20, 2025",
    views: 1876,
    likes: 78,
    image: "/product-launch-excitement.png",
  },
  {
    id: "12",
    title: "Creating Effective Landing Pages",
    type: "Tutorial",
    status: "Published",
    author: "Michael Chen",
    date: "April 18, 2025",
    views: 1543,
    likes: 67,
    image: "/website-design-concept.png",
  },
  {
    id: "13",
    title: "Content Repurposing Strategies",
    type: "Guide",
    status: "Draft",
    author: "Emma Rodriguez",
    date: "April 15, 2025",
    views: 0,
    likes: 0,
    image: "/brand-guidelines-concept.png",
  },
  {
    id: "14",
    title: "Case Study: Social Media Campaign Success",
    type: "Case Study",
    status: "Published",
    author: "David Kim",
    date: "April 12, 2025",
    views: 982,
    likes: 45,
    image: "/project-asset-concept.png",
  },
  {
    id: "15",
    title: "Email Subject Line Best Practices",
    type: "Blog Post",
    status: "Review",
    author: "Jessica Lee",
    date: "April 10, 2025",
    views: 0,
    likes: 0,
    image: "/marketing-campaign-brainstorm.png",
  },
  {
    id: "16",
    title: "Content Marketing Strategy Template",
    type: "Template",
    status: "Published",
    author: "Sarah Johnson",
    date: "April 8, 2025",
    views: 2345,
    likes: 112,
    image: "/interconnected-social-media.png",
  },
]

export default function Content() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Filter content based on search query and active tab
  const filteredContent = contentData.filter((content) => {
    const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "published" && content.status === "Published") ||
      (activeTab === "drafts" && content.status === "Draft") ||
      (activeTab === "review" && content.status === "Review")
    return matchesSearch && matchesTab
  })

  // Get counts for tabs
  const publishedCount = contentData.filter((content) => content.status === "Published").length
  const draftsCount = contentData.filter((content) => content.status === "Draft").length
  const reviewCount = contentData.filter((content) => content.status === "Review").length

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Content Management</h1>
            <p className="text-muted-foreground">Manage and organize your content</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Content
          </Button>
        </div>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search content..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="h-9">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Sort
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" className="flex-1 flex flex-col overflow-hidden" onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger
                value="all"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 px-4"
              >
                All Content ({contentData.length})
              </TabsTrigger>
              <TabsTrigger
                value="published"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 px-4"
              >
                Published ({publishedCount})
              </TabsTrigger>
              <TabsTrigger
                value="drafts"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 px-4"
              >
                Drafts ({draftsCount})
              </TabsTrigger>
              <TabsTrigger
                value="review"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 px-4"
              >
                In Review ({reviewCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="flex-1 overflow-auto mt-0 p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
                {filteredContent.map((content) => (
                  <ContentCard key={content.id} content={content} projectId="1" />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="published" className="flex-1 overflow-auto mt-0 p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
                {filteredContent.map((content) => (
                  <ContentCard key={content.id} content={content} projectId="1" />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="drafts" className="flex-1 overflow-auto mt-0 p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
                {filteredContent.map((content) => (
                  <ContentCard key={content.id} content={content} projectId="1" />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="review" className="flex-1 overflow-auto mt-0 p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
                {filteredContent.map((content) => (
                  <ContentCard key={content.id} content={content} projectId="1" />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  )
}

function ContentCard({ content, projectId }: { content: (typeof contentData)[0]; projectId: string }) {
  return (
    <Card className="overflow-hidden border-muted/60 hover:border-muted transition-colors group">
      <div className="relative h-40 overflow-hidden">
        <img
          src={content.image || "/placeholder.svg"}
          alt={content.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute top-2 right-2">
          <Badge
            variant="outline"
            className={`
              ${
                content.status === "Published"
                  ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/30"
                  : content.status === "Draft"
                    ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/30"
                    : "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/30"
              }
            `}
          >
            {content.status}
          </Badge>
        </div>
      </div>
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="secondary" className="text-xs font-normal">
            {content.type}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/projects/${projectId}/content/${content.id}`}>
                  <Eye className="mr-2 h-4 w-4" /> View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Link href={`/projects/${projectId}/content/${content.id}`} className="block">
          <h3 className="font-semibold line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {content.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mb-2">By {content.author}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            {content.date}
          </div>
          <div className="flex items-center gap-2">
            {content.status === "Published" && (
              <>
                <div className="flex items-center">
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  {content.views}
                </div>
                <div className="flex items-center">
                  <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                  {content.likes}
                </div>
              </>
            )}
            {content.status !== "Published" && (
              <div className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1" />
                Draft
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
