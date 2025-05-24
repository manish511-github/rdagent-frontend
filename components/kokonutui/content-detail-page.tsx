"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Globe,
  Heart,
  History,
  ImageIcon,
  Link2,
  MessageSquare,
  MoreHorizontal,
  Play,
  Share2,
  ThumbsUp,
  Users,
  Plus,
} from "lucide-react"

// Sample content data
const contentData = [
  {
    id: "1",
    title: "10 Ways AI is Transforming Marketing in 2025",
    summary:
      "Discover how artificial intelligence is revolutionizing marketing strategies and creating unprecedented opportunities for businesses in 2025.",
    type: "Blog Post",
    status: "Published",
    author: {
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40&query=SJ",
      role: "Content Strategist",
    },
    collaborators: [
      { name: "Michael Chen", avatar: "/placeholder.svg?height=40&width=40&query=MC" },
      { name: "Emma Rodriguez", avatar: "/placeholder.svg?height=40&width=40&query=ER" },
    ],
    date: "May 15, 2025",
    publishedDate: "May 15, 2025",
    lastEdited: "May 14, 2025",
    views: 3245,
    likes: 142,
    shares: 87,
    comments: 32,
    featuredImage: "/marketing-campaign-brainstorm.png",
    gallery: [
      { type: "image", url: "/marketing-campaign-brainstorm.png", caption: "AI-powered marketing campaign planning" },
      { type: "image", url: "/interconnected-social-media.png", caption: "Social media integration with AI" },
      { type: "image", url: "/creative-workflow-dashboard.png", caption: "AI creative workflow automation" },
      {
        type: "video",
        url: "https://example.com/video.mp4",
        thumbnail: "/product-launch-excitement.png",
        caption: "AI Marketing Demo",
      },
    ],
    content: `
      <h2>Introduction</h2>
      <p>Artificial Intelligence is revolutionizing the marketing landscape in unprecedented ways. As we move further into 2025, the integration of AI technologies into marketing strategies has become not just advantageous but essential for businesses looking to maintain a competitive edge.</p>
      
      <h2>1. Hyper-Personalized Customer Experiences</h2>
      <p>AI algorithms now analyze customer data with remarkable precision, enabling marketers to create truly personalized experiences at scale. From product recommendations to custom content delivery, AI ensures that each customer interaction feels uniquely tailored.</p>
      
      <h2>2. Predictive Analytics for Campaign Optimization</h2>
      <p>Predictive models powered by AI can now forecast campaign performance with up to 95% accuracy, allowing marketers to optimize resource allocation and maximize ROI before a campaign even launches.</p>
      
      <h2>3. Conversational Marketing Through Advanced Chatbots</h2>
      <p>The latest generation of AI chatbots can maintain contextual conversations that are nearly indistinguishable from human interactions, providing 24/7 customer engagement without sacrificing the personal touch.</p>
      
      <h2>4. Content Creation and Curation</h2>
      <p>AI tools now generate and curate content that resonates with specific audience segments, dramatically reducing the time and resources required for content production while maintaining quality and relevance.</p>
      
      <h2>5. Voice Search Optimization</h2>
      <p>With voice-activated devices becoming ubiquitous, AI-driven voice search optimization has become a critical component of SEO strategies, focusing on natural language processing and conversational keywords.</p>
      
      <h2>6. Automated Multivariate Testing</h2>
      <p>AI systems can now simultaneously test hundreds of variables in marketing campaigns, identifying optimal combinations for different audience segments with minimal human intervention.</p>
      
      <h2>7. Emotion Recognition in Customer Interactions</h2>
      <p>Advanced AI can analyze customer sentiment across channels, allowing marketers to respond appropriately to emotional cues and build stronger brand relationships.</p>
      
      <h2>8. Dynamic Pricing Strategies</h2>
      <p>AI algorithms continuously analyze market conditions, competitor pricing, and customer behavior to implement dynamic pricing strategies that maximize both sales and customer satisfaction.</p>
      
      <h2>9. Augmented Reality Marketing Experiences</h2>
      <p>AI-powered AR applications create immersive brand experiences, allowing customers to visualize products in their own environment before making purchase decisions.</p>
      
      <h2>10. Cross-Channel Attribution Modeling</h2>
      <p>AI has finally solved the attribution puzzle, accurately tracking customer journeys across multiple channels and touchpoints to provide true insights into campaign effectiveness.</p>
      
      <h2>Conclusion</h2>
      <p>As AI technology continues to evolve, its applications in marketing will only become more sophisticated and integral to success. Marketers who embrace these AI-driven approaches now will be well-positioned to lead in the increasingly competitive digital landscape.</p>
    `,
    tags: ["Artificial Intelligence", "Marketing Trends", "Digital Strategy", "Technology", "Business"],
    categories: ["Marketing Technology", "Digital Transformation"],
    seoScore: 92,
    readability: "Advanced",
    readTime: "8 min",
    targetAudience: ["Marketing Professionals", "Business Executives", "Technology Enthusiasts"],
    callToAction: "Subscribe to our newsletter for more insights",
    conversionRate: "3.8%",
    engagementRate: "12.5%",
    versions: [
      { version: "1.0", date: "May 10, 2025", editor: "Sarah Johnson", notes: "Initial draft" },
      { version: "1.1", date: "May 12, 2025", editor: "Michael Chen", notes: "Added case studies and examples" },
      { version: "1.2", date: "May 14, 2025", editor: "Emma Rodriguez", notes: "Final edits and SEO optimization" },
      { version: "1.3", date: "May 15, 2025", editor: "Sarah Johnson", notes: "Published version" },
    ],
    comments: [
      {
        id: "c1",
        author: { name: "David Kim", avatar: "/placeholder.svg?height=40&width=40&query=DK" },
        date: "May 15, 2025",
        content: "Great article! The section on predictive analytics was particularly insightful.",
        likes: 5,
      },
      {
        id: "c2",
        author: { name: "Jessica Lee", avatar: "/placeholder.svg?height=40&width=40&query=JL" },
        date: "May 16, 2025",
        content:
          "I'd love to see more examples of how small businesses can implement these AI strategies with limited budgets.",
        likes: 3,
      },
      {
        id: "c3",
        author: { name: "Robert Chen", avatar: "/placeholder.svg?height=40&width=40&query=RC" },
        date: "May 16, 2025",
        content:
          "The point about emotion recognition is fascinating. Are there any specific tools you recommend for this?",
        likes: 2,
      },
    ],
    relatedContent: [
      {
        id: "2",
        title: "The Future of Social Media Marketing",
        type: "Whitepaper",
        image: "/interconnected-social-media.png",
      },
      {
        id: "4",
        title: "Case Study: How We Increased Conversion by 45%",
        type: "Case Study",
        image: "/product-launch-excitement.png",
      },
      {
        id: "9",
        title: "How to Measure Content Marketing ROI",
        type: "Blog Post",
        image: "/creative-workflow-dashboard.png",
      },
    ],
    distribution: {
      channels: ["Website", "Email Newsletter", "LinkedIn", "Twitter", "Facebook"],
      schedule: {
        website: "May 15, 2025",
        email: "May 16, 2025",
        social: "May 15-17, 2025",
      },
    },
    analytics: {
      trafficSources: [
        { source: "Organic Search", percentage: 45 },
        { source: "Social Media", percentage: 30 },
        { source: "Email", percentage: 15 },
        { source: "Direct", percentage: 10 },
      ],
      deviceBreakdown: [
        { device: "Mobile", percentage: 65 },
        { device: "Desktop", percentage: 30 },
        { device: "Tablet", percentage: 5 },
      ],
      timeOnPage: "4:32",
      bounceRate: "22%",
    },
  },
]

export default function ContentDetailPage({ projectId, contentId }: { projectId: string; contentId: string }) {
  const router = useRouter()
  const [content, setContent] = useState<(typeof contentData)[0] | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [activeTab, setActiveTab] = useState("content")
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showTableOfContents, setShowTableOfContents] = useState(true)

  // Simulate fetching content data
  useEffect(() => {
    // In a real app, you would fetch the content data from an API
    const foundContent = contentData.find((item) => item.id === contentId)
    if (foundContent) {
      setContent(foundContent)
    }
  }, [contentId])

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        setIsScrolled(contentRef.current.scrollTop > 100)
      }
    }

    const currentContentRef = contentRef.current
    if (currentContentRef) {
      currentContentRef.addEventListener("scroll", handleScroll)
    }

    return () => {
      if (currentContentRef) {
        currentContentRef.removeEventListener("scroll", handleScroll)
      }
    }
  }, [])

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Content Not Found</h2>
        <p className="text-muted-foreground mb-4">The content you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href={`/projects/${projectId}/content`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Content
          </Link>
        </Button>
      </div>
    )
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const updatedContent = { ...content }
    updatedContent.comments = [
      {
        id: `c${content.comments.length + 1}`,
        author: { name: "You", avatar: "/placeholder.svg?height=40&width=40&query=You" },
        date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        content: newComment,
        likes: 0,
      },
      ...updatedContent.comments,
    ]
    setContent(updatedContent)
    setNewComment("")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/30"
      case "Draft":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/30"
      case "Review":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/30"
      default:
        return ""
    }
  }

  const nextGalleryItem = () => {
    setCurrentGalleryIndex((prev) => (prev + 1) % content.gallery.length)
  }

  const prevGalleryItem = () => {
    setCurrentGalleryIndex((prev) => (prev - 1 + content.gallery.length) % content.gallery.length)
  }

  const currentGalleryItem = content.gallery[currentGalleryIndex]

  // Extract headings for table of contents
  const extractHeadings = () => {
    const headingRegex = /<h2>(.*?)<\/h2>/g
    const headings = []
    let match

    while ((match = headingRegex.exec(content.content)) !== null) {
      headings.push(match[1])
    }

    return headings
  }

  const headings = extractHeadings()

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Sticky Header - shows on scroll */}
      <div
        className={`sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b transition-all duration-300 ${
          isScrolled ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="font-medium text-lg line-clamp-1">{content.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "View" : "Edit"}
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full overflow-hidden">
          <div className="border-b bg-muted/30">
            <div className="container mx-auto px-4">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
                <TabsTrigger
                  value="content"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4"
                >
                  Content
                </TabsTrigger>
                <TabsTrigger
                  value="comments"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4"
                >
                  Comments ({content.comments.length})
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4"
                >
                  Analytics
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4"
                >
                  History
                </TabsTrigger>
                <TabsTrigger
                  value="distribution"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4"
                >
                  Distribution
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Content Tab */}
          <TabsContent value="content" className="flex-1 overflow-hidden p-0 m-0">
            {isEditing ? (
              <div className="h-full overflow-auto p-4">
                <div className="container mx-auto max-w-4xl">
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium mb-2">
                            Title
                          </label>
                          <input
                            id="title"
                            className="w-full p-3 border rounded-md text-lg font-medium"
                            defaultValue={content.title}
                          />
                        </div>
                        <div>
                          <label htmlFor="summary" className="block text-sm font-medium mb-2">
                            Summary
                          </label>
                          <textarea
                            id="summary"
                            className="w-full p-3 border rounded-md"
                            rows={3}
                            defaultValue={content.summary}
                          />
                        </div>
                        <div>
                          <label htmlFor="featured-image" className="block text-sm font-medium mb-2">
                            Featured Image
                          </label>
                          <div className="border rounded-md p-4 bg-muted/30">
                            <div className="aspect-video relative rounded-lg overflow-hidden mb-4">
                              <img
                                src={content.featuredImage || "/placeholder.svg"}
                                alt="Featured image"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Button variant="outline" size="sm">
                              <ImageIcon className="mr-2 h-4 w-4" /> Change Image
                            </Button>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="content-editor" className="block text-sm font-medium mb-2">
                            Content
                          </label>
                          <textarea
                            id="content-editor"
                            className="w-full min-h-[400px] p-3 border rounded-md font-mono"
                            defaultValue={content.content}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                          </Button>
                          <Button onClick={() => setIsEditing(false)}>Save Changes</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="h-full overflow-auto" ref={contentRef}>
                {/* Hero Section */}
                <div className="relative">
                  <div className="h-[40vh] md:h-[50vh] relative overflow-hidden">
                    <img
                      src={content.featuredImage || "/placeholder.svg"}
                      alt={content.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                  </div>
                  <div className="container mx-auto px-4 relative -mt-32 md:-mt-40">
                    <div className="bg-background rounded-t-xl shadow-lg p-6 md:p-8 max-w-4xl mx-auto">
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <Badge variant="secondary" className="font-normal">
                          {content.type}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(content.status)}>
                          {content.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {content.publishedDate}
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {content.readTime} read
                        </span>
                      </div>
                      <h1 className="text-3xl md:text-4xl font-bold mb-4">{content.title}</h1>
                      <p className="text-lg text-muted-foreground mb-6">{content.summary}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-background">
                            <AvatarImage src={content.author.avatar || "/placeholder.svg"} alt={content.author.name} />
                            <AvatarFallback>
                              {content.author.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{content.author.name}</p>
                            <p className="text-sm text-muted-foreground">{content.author.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                  <Heart className="h-5 w-5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Like</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                  <MessageSquare className="h-5 w-5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Comment</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="rounded-full">
                                <Share2 className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <svg
                                  className="mr-2 h-4 w-4 text-[#1877F2]"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                Facebook
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <svg
                                  className="mr-2 h-4 w-4 text-[#1DA1F2]"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                </svg>
                                Twitter
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <svg
                                  className="mr-2 h-4 w-4 text-[#0A66C2]"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                                LinkedIn
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Link2 className="mr-2 h-4 w-4" /> Copy Link
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-8">
                  <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
                    {/* Table of Contents - Desktop */}
                    <div className="hidden md:block w-64 shrink-0">
                      <div className="sticky top-24">
                        <div className="bg-muted/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium flex items-center">
                              <BookOpen className="h-4 w-4 mr-2" /> Contents
                            </h3>
                          </div>
                          <nav className="space-y-1">
                            {headings.map((heading, index) => (
                              <a
                                key={index}
                                href={`#heading-${index}`}
                                className="block text-sm py-1.5 px-2 rounded-md hover:bg-muted transition-colors"
                              >
                                {heading}
                              </a>
                            ))}
                          </nav>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Table of Contents - Mobile */}
                      <div className="md:hidden mb-6">
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                          onClick={() => setShowTableOfContents(!showTableOfContents)}
                        >
                          <span className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-2" /> Table of Contents
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${showTableOfContents ? "rotate-180" : ""}`}
                          />
                        </Button>
                        {showTableOfContents && (
                          <div className="mt-2 border rounded-lg p-3 bg-muted/30">
                            <nav className="space-y-1">
                              {headings.map((heading, index) => (
                                <a
                                  key={index}
                                  href={`#heading-${index}`}
                                  className="block text-sm py-1.5 px-2 rounded-md hover:bg-muted transition-colors"
                                >
                                  {heading}
                                </a>
                              ))}
                            </nav>
                          </div>
                        )}
                      </div>

                      {/* Media Gallery */}
                      <div className="mb-8 bg-muted/30 rounded-lg p-4">
                        <h3 className="font-medium mb-3">Media Gallery</h3>
                        <div className="relative">
                          <div className="aspect-video rounded-lg overflow-hidden bg-muted relative">
                            {currentGalleryItem.type === "image" ? (
                              <img
                                src={currentGalleryItem.url || "/placeholder.svg"}
                                alt={currentGalleryItem.caption}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center relative">
                                <img
                                  src={currentGalleryItem.thumbnail || "/placeholder.svg"}
                                  alt={currentGalleryItem.caption}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <Button variant="outline" className="rounded-full">
                                    <Play className="h-6 w-6 fill-current" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                            onClick={prevGalleryItem}
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                            onClick={nextGalleryItem}
                          >
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                            {content.gallery.map((_, index) => (
                              <button
                                key={index}
                                className={`h-1.5 rounded-full transition-all ${
                                  index === currentGalleryIndex ? "w-6 bg-primary" : "w-1.5 bg-primary/30"
                                }`}
                                onClick={() => setCurrentGalleryIndex(index)}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 text-center">{currentGalleryItem.caption}</p>
                      </div>

                      {/* Article Content */}
                      <article className="prose dark:prose-invert max-w-none">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: content.content.replace(/<h2>(.*?)<\/h2>/g, (match, heading, index) => {
                              const i = headings.indexOf(heading)
                              return `<h2 id="heading-${i}">${heading}</h2>`
                            }),
                          }}
                        />
                      </article>

                      {/* Tags */}
                      <div className="mt-8">
                        <h3 className="font-medium mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {content.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="font-normal">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Author Bio */}
                      <div className="mt-8 border-t pt-8">
                        <h3 className="font-medium mb-4">About the Author</h3>
                        <div className="flex items-start gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={content.author.avatar || "/placeholder.svg"} alt={content.author.name} />
                            <AvatarFallback>
                              {content.author.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium text-lg">{content.author.name}</h4>
                            <p className="text-muted-foreground mb-2">{content.author.role}</p>
                            <p className="text-sm">
                              Sarah is a content strategist with over 10 years of experience in digital marketing. She
                              specializes in AI-driven marketing strategies and has helped numerous companies transform
                              their digital presence.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Related Content */}
                      <div className="mt-8 border-t pt-8">
                        <h3 className="font-medium mb-4">Related Content</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {content.relatedContent.map((item) => (
                            <Link key={item.id} href={`/projects/${projectId}/content/${item.id}`} className="group">
                              <div className="rounded-lg overflow-hidden aspect-video mb-2">
                                <img
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.title}
                                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />
                              </div>
                              <h4 className="font-medium group-hover:text-primary transition-colors">{item.title}</h4>
                              <p className="text-sm text-muted-foreground">{item.type}</p>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Call to Action */}
                      <div className="mt-8 bg-primary/10 rounded-lg p-6 text-center">
                        <h3 className="font-medium text-lg mb-2">Stay Updated</h3>
                        <p className="mb-4">{content.callToAction}</p>
                        <div className="flex max-w-md mx-auto">
                          <input
                            type="email"
                            placeholder="Your email address"
                            className="flex-1 rounded-l-md border border-r-0 px-3 py-2"
                          />
                          <Button className="rounded-l-none">Subscribe</Button>
                        </div>
                      </div>

                      {/* Engagement Footer */}
                      <div className="mt-8 border-t pt-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Button variant="outline" size="sm" className="gap-2">
                            <ThumbsUp className="h-4 w-4" />
                            <span>Like</span>
                            <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">{content.likes}</span>
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Share2 className="h-4 w-4" />
                            <span>Share</span>
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Eye className="h-4 w-4" />
                          <span>{content.views.toLocaleString()} views</span>
                        </div>
                      </div>

                      {/* Navigation Between Articles */}
                      <div className="mt-8 border-t pt-6 grid grid-cols-2 gap-4">
                        <Button variant="outline" className="justify-start">
                          <ChevronLeft className="mr-2 h-4 w-4" /> Previous Article
                        </Button>
                        <Button variant="outline" className="justify-end">
                          Next Article <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="flex-1 overflow-auto p-4">
            <div className="container mx-auto max-w-4xl">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Comments ({content.comments.length})</h2>
                  <div className="mb-8">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="resize-none min-h-24"
                    />
                    <div className="flex justify-end mt-3">
                      <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                        Post Comment
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {content.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-4">
                        <Avatar>
                          <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.name} />
                          <AvatarFallback>
                            {comment.author.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{comment.author.name}</p>
                              <p className="text-xs text-muted-foreground">{comment.date}</p>
                            </div>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="mt-2">{comment.content}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                              <span>{comment.likes}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <MessageSquare className="h-3.5 w-3.5 mr-1" />
                              <span>Reply</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="flex-1 overflow-auto p-4">
            <div className="container mx-auto max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800/30">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <Eye className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
                      <span className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                        {content.views.toLocaleString()}
                      </span>
                      <span className="text-sm text-blue-600 dark:text-blue-400">Total Views</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800/30">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <ThumbsUp className="h-8 w-8 text-green-600 dark:text-green-400 mb-2" />
                      <span className="text-3xl font-bold text-green-700 dark:text-green-300">
                        {content.likes.toLocaleString()}
                      </span>
                      <span className="text-sm text-green-600 dark:text-green-400">Total Likes</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800/30">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <Share2 className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
                      <span className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                        {content.shares.toLocaleString()}
                      </span>
                      <span className="text-sm text-purple-600 dark:text-purple-400">Total Shares</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200 dark:border-amber-800/30">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <MessageSquare className="h-8 w-8 text-amber-600 dark:text-amber-400 mb-2" />
                      <span className="text-3xl font-bold text-amber-700 dark:text-amber-300">
                        {content.comments.length.toLocaleString()}
                      </span>
                      <span className="text-sm text-amber-600 dark:text-amber-400">Total Comments</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Traffic Sources</h3>
                    <div className="space-y-4">
                      {content.analytics.trafficSources.map((source) => (
                        <div key={source.source}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{source.source}</span>
                            <span className="text-sm">{source.percentage}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-2.5 rounded-full ${
                                source.source === "Organic Search"
                                  ? "bg-blue-500"
                                  : source.source === "Social Media"
                                    ? "bg-purple-500"
                                    : source.source === "Email"
                                      ? "bg-amber-500"
                                      : "bg-green-500"
                              }`}
                              style={{ width: `${source.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Device Breakdown</h3>
                    <div className="space-y-4">
                      {content.analytics.deviceBreakdown.map((device) => (
                        <div key={device.device}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{device.device}</span>
                            <span className="text-sm">{device.percentage}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-2.5 rounded-full ${
                                device.device === "Mobile"
                                  ? "bg-indigo-500"
                                  : device.device === "Desktop"
                                    ? "bg-teal-500"
                                    : "bg-rose-500"
                              }`}
                              style={{ width: `${device.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Engagement Metrics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Avg. Time on Page</div>
                        <div className="text-2xl font-bold">{content.analytics.timeOnPage}</div>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Bounce Rate</div>
                        <div className="text-2xl font-bold">{content.analytics.bounceRate}</div>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Conversion Rate</div>
                        <div className="text-2xl font-bold">{content.conversionRate}</div>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Engagement Rate</div>
                        <div className="text-2xl font-bold">{content.engagementRate}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Content Performance</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Views Ranking</span>
                        <Badge className="bg-blue-600">Top 10%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Engagement Ranking</span>
                        <Badge className="bg-purple-600">Top 15%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Conversion Ranking</span>
                        <Badge className="bg-amber-600">Top 20%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Performance</span>
                        <Badge className="bg-green-600">Excellent</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="flex-1 overflow-auto p-4">
            <div className="container mx-auto max-w-4xl">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Version History</h2>
                  <div className="relative border-l-2 border-muted pl-6 ml-3 space-y-8">
                    {content.versions.map((version, index) => (
                      <div key={version.version} className="relative">
                        <div className="absolute -left-[31px] top-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-[10px] text-primary-foreground font-bold">{version.version}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <p className="font-medium">Version {version.version}</p>
                            <p className="text-sm text-muted-foreground">
                              Edited by {version.editor} on {version.date}
                            </p>
                            <p className="text-sm mt-1">{version.notes}</p>
                          </div>
                          <div className="flex gap-2 self-end sm:self-auto">
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-3.5 w-3.5" /> View
                            </Button>
                            {index !== 0 && (
                              <Button variant="outline" size="sm">
                                <History className="mr-2 h-3.5 w-3.5" /> Restore
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Distribution Tab */}
          <TabsContent value="distribution" className="flex-1 overflow-auto p-4">
            <div className="container mx-auto max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Distribution Channels</h3>
                    <div className="space-y-4">
                      {content.distribution.channels.map((channel) => (
                        <div key={channel} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {channel === "Website" && <Globe className="h-5 w-5 text-blue-500" />}
                            {channel === "Email Newsletter" && <Mail className="h-5 w-5 text-amber-500" />}
                            {channel === "LinkedIn" && <Linkedin className="h-5 w-5 text-blue-600" />}
                            {channel === "Twitter" && <Twitter className="h-5 w-5 text-sky-500" />}
                            {channel === "Facebook" && <Facebook className="h-5 w-5 text-blue-700" />}
                            <span>{channel}</span>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/30"
                          >
                            Published
                          </Badge>
                        </div>
                      ))}
                      <Button className="w-full">
                        <Plus className="mr-2 h-4 w-4" /> Add Channel
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Publishing Schedule</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-blue-500" />
                          <div>
                            <p>Website</p>
                            <p className="text-xs text-muted-foreground">{content.distribution.schedule.website}</p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/30"
                        >
                          Published
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-amber-500" />
                          <div>
                            <p>Email Newsletter</p>
                            <p className="text-xs text-muted-foreground">{content.distribution.schedule.email}</p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/30"
                        >
                          Scheduled
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-indigo-500" />
                          <div>
                            <p>Social Media</p>
                            <p className="text-xs text-muted-foreground">{content.distribution.schedule.social}</p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/30"
                        >
                          In Progress
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function Mail(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function Facebook(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function Linkedin(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function Twitter(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  )
}
