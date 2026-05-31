"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Youtube, Twitter, Facebook, Instagram, Linkedin, Loader2, Plus, X, ExternalLink } from "lucide-react"
import { getApiUrl } from "@/lib/config"
import Cookies from "js-cookie"
import { refreshAccessToken } from "@/lib/utils"

// Reddit icon component
function RedditIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
    )
}

type SocialPlatform = {
    id: string
    name: string
    icon: React.ReactNode
    placeholder: string
    urlPattern: RegExp
    exampleUrl: string
}

const SOCIAL_PLATFORMS: SocialPlatform[] = [
    {
        id: "youtube",
        name: "YouTube",
        icon: <Youtube className="h-5 w-5 text-red-500" />,
        placeholder: "https://youtube.com/@channel or https://youtube.com/c/channel",
        urlPattern: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i,
        exampleUrl: "https://youtube.com/@example",
    },
    {
        id: "twitter",
        name: "Twitter / X",
        icon: <Twitter className="h-5 w-5 text-sky-500" />,
        placeholder: "https://twitter.com/username or https://x.com/username",
        urlPattern: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\//i,
        exampleUrl: "https://x.com/example",
    },
    {
        id: "facebook",
        name: "Facebook",
        icon: <Facebook className="h-5 w-5 text-blue-600" />,
        placeholder: "https://facebook.com/pagename",
        urlPattern: /^https?:\/\/(www\.)?facebook\.com\//i,
        exampleUrl: "https://facebook.com/example",
    },
    {
        id: "instagram",
        name: "Instagram",
        icon: <Instagram className="h-5 w-5 text-pink-500" />,
        placeholder: "https://instagram.com/username",
        urlPattern: /^https?:\/\/(www\.)?instagram\.com\//i,
        exampleUrl: "https://instagram.com/example",
    },
    {
        id: "linkedin",
        name: "LinkedIn",
        icon: <Linkedin className="h-5 w-5 text-blue-700" />,
        placeholder: "https://linkedin.com/company/name",
        urlPattern: /^https?:\/\/(www\.)?linkedin\.com\//i,
        exampleUrl: "https://linkedin.com/company/example",
    },
    {
        id: "reddit",
        name: "Reddit",
        icon: <RedditIcon className="h-5 w-5 text-orange-500" />,
        placeholder: "https://reddit.com/r/subreddit or https://reddit.com/user/username",
        urlPattern: /^https?:\/\/(www\.)?reddit\.com\//i,
        exampleUrl: "https://reddit.com/r/example",
    },
]

type SocialLinks = {
    [key: string]: string[]
}

type AddSocialLinksDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    projectId?: string
    userId: number
    companyUrl: string
    existingLinks?: SocialLinks
    onSuccess?: (data: any) => void
    platforms?: string[] // Optional: filter to show only specific platforms (e.g., ["youtube", "twitter", "facebook"])
}

export function AddSocialLinksDialog({
    open,
    onOpenChange,
    projectId,
    userId,
    companyUrl,
    existingLinks = {},
    onSuccess,
    platforms,
}: AddSocialLinksDialogProps) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [links, setLinks] = useState<SocialLinks>(() => {
        // Initialize with existing links or empty arrays
        const initial: SocialLinks = {}
        const platformsToInit = platforms 
            ? SOCIAL_PLATFORMS.filter((p) => platforms.includes(p.id))
            : SOCIAL_PLATFORMS
        platformsToInit.forEach((platform) => {
            initial[platform.id] = existingLinks[platform.id] || []
        })
        return initial
    })
    const [inputValues, setInputValues] = useState<{ [key: string]: string }>({})
    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    const validateUrl = (platformId: string, url: string): boolean => {
        const platform = SOCIAL_PLATFORMS.find((p) => p.id === platformId)
        if (!platform) return false

        // Basic URL validation
        try {
            new URL(url)
        } catch {
            return false
        }

        // Platform-specific validation
        return platform.urlPattern.test(url)
    }

    const handleAddLink = (platformId: string) => {
        const url = inputValues[platformId]?.trim()
        if (!url) return

        if (!validateUrl(platformId, url)) {
            const platform = SOCIAL_PLATFORMS.find((p) => p.id === platformId)
            setErrors((prev) => ({
                ...prev,
                [platformId]: `Please enter a valid ${platform?.name} URL`,
            }))
            return
        }

        // Check for duplicates
        if (links[platformId]?.includes(url)) {
            setErrors((prev) => ({
                ...prev,
                [platformId]: "This URL has already been added",
            }))
            return
        }

        // Only allow one URL per platform - replace if one already exists
        setLinks((prev) => ({
            ...prev,
            [platformId]: [url], // Only one URL allowed
        }))
        setInputValues((prev) => ({ ...prev, [platformId]: "" }))
        setErrors((prev) => ({ ...prev, [platformId]: "" }))
    }

    const handleRemoveLink = (platformId: string, url: string) => {
        setLinks((prev) => ({
            ...prev,
            [platformId]: prev[platformId]?.filter((l) => l !== url) || [],
        }))
    }

    const handleInputChange = (platformId: string, value: string) => {
        setInputValues((prev) => ({ ...prev, [platformId]: value }))
        // Clear errors when user starts typing
        if (errors[platformId]) {
            setErrors((prev) => ({ ...prev, [platformId]: "" }))
        }
    }
    
    // Check if current input value is valid
    const isInputValid = (platformId: string): boolean => {
        const url = inputValues[platformId]?.trim()
        if (!url) return false
        return validateUrl(platformId, url)
    }

    const handleKeyDown = (platformId: string, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault()
            // Directly trigger analysis if URL is valid
            const url = inputValues[platformId]?.trim()
            if (url && validateUrl(platformId, url)) {
                handleSubmit()
            }
        }
    }

    const getLinksToSubmit = (): SocialLinks => {
        const result: SocialLinks = {}
        const platformsToCheck = platforms 
            ? SOCIAL_PLATFORMS.filter((p) => platforms.includes(p.id))
            : SOCIAL_PLATFORMS
        platformsToCheck.forEach((platform) => {
            // Get URL from input field directly
            const url = inputValues[platform.id]?.trim()
            if (url && validateUrl(platform.id, url)) {
                // Only one URL per platform
                result[platform.id] = [url]
            }
        })
        return result
    }

    const hasValidUrlToAnalyze = () => {
        const platformsToCheck = platforms 
            ? SOCIAL_PLATFORMS.filter((p) => platforms.includes(p.id))
            : SOCIAL_PLATFORMS
        
        // Check if there's a valid URL in the input field
        return platformsToCheck.some((platform) => {
            const url = inputValues[platform.id]?.trim()
            if (!url) return false
            return validateUrl(platform.id, url)
        })
    }

    const handleSubmit = async () => {
        // Validate required context
        if (!projectId || !userId || !companyUrl) {
            toast({
                title: "Missing configuration",
                description: "Unable to add social links. Please ensure you're viewing a competitor analysis.",
                variant: "destructive",
            })
            return
        }

        const linksToSubmit = getLinksToSubmit()

        if (Object.keys(linksToSubmit).length === 0) {
            toast({
                title: "No links to add",
                description: "Please add at least one social media link.",
                variant: "destructive",
            })
            return
        }

        setIsSubmitting(true)

        try {
            let token = Cookies.get("access_token")

            let response = await fetch(getApiUrl("/company/competitor/social-links"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    accept: "application/json",
                },
                body: JSON.stringify({
                    project_id: projectId,
                    user_id: userId,
                    url: companyUrl,
                    links: linksToSubmit,
                }),
            })

            // Handle token refresh
            if (response.status === 401) {
                token = await refreshAccessToken()
                if (token) {
                    response = await fetch(getApiUrl("/company/competitor/social-links"), {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                            accept: "application/json",
                        },
                        body: JSON.stringify({
                            project_id: projectId,
                            user_id: userId,
                            url: companyUrl,
                            links: linksToSubmit,
                        }),
                    })
                }
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData?.detail || "Failed to add social media links")
            }

            const data = await response.json()

            toast({
                title: "Social links updated successfully",
                description: "The social media analysis will be available shortly.",
            })

            onSuccess?.(data)
            onOpenChange(false)
        } catch (error: any) {
            toast({
                title: "Failed to add social links",
                description: error?.message || "An error occurred. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        {platforms && platforms.length === 1
                            ? `Add ${SOCIAL_PLATFORMS.find((p) => p.id === platforms[0])?.name || "Social Media"} Link`
                            : "Add Social Media Links"}
                    </DialogTitle>
                    <DialogDescription>
                        {platforms && platforms.length === 1
                            ? `Enter ${SOCIAL_PLATFORMS.find((p) => p.id === platforms[0])?.name || "social media"} profile URL and click Analyze to start the analysis.`
                            : "Enter social media profile URLs and click Analyze to start the analysis for each profile."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {SOCIAL_PLATFORMS.filter((platform) => 
                        !platforms || platforms.includes(platform.id)
                    ).map((platform) => (
                        <div key={platform.id} className="space-y-3">
                            <div className="flex items-center gap-2">
                                {platform.icon}
                                <Label className="text-sm font-medium">{platform.name}</Label>
                            </div>

                            {/* Input Field */}
                            <div className="flex gap-2">
                                <Input
                                    type="url"
                                    placeholder={platform.placeholder}
                                    value={inputValues[platform.id] || ""}
                                    onChange={(e) => handleInputChange(platform.id, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(platform.id, e)}
                                    className={errors[platform.id] ? "border-red-500" : ""}
                                />
                            </div>

                            {errors[platform.id] && <p className="text-sm text-red-500">{errors[platform.id]}</p>}
                        </div>
                    ))}
                </div>

                <DialogFooter className="flex gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !hasValidUrlToAnalyze()}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Plus className="mr-2 h-4 w-4" />
                                Analyze
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
