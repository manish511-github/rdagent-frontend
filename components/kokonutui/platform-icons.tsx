import type { SVGProps } from "react"
import { Twitter, Linkedin, Instagram, Mail, MessageSquare } from "lucide-react"

export function RedditIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 8c2.648 0 5.028.826 6.675 2.14a2.5 2.5 0 0 1 2.326-1.64 2.5 2.5 0 0 1 2.5 2.5c0 1.278-.96 2.33-2.2 2.47A7.664 7.664 0 0 1 12 16a7.664 7.664 0 0 1-9.3-3.53 2.5 2.5 0 0 1-2.2-2.47 2.5 2.5 0 0 1 2.5-2.5 2.5 2.5 0 0 1 2.325 1.64A12.078 12.078 0 0 1 12 8Z" />
      <path d="M17.5 11a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
      <path d="M6.5 11a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
      <path d="M10 17a2 2 0 1 0 4 0" />
    </svg>
  )
}

export function DiscordIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="9" cy="12" r="1" />
      <circle cx="15" cy="12" r="1" />
      <path d="M7.5 7.2c3.5-1 5.5-1 9 0" />
      <path d="M7 16.2c3.5 1 6.5 1 10 0" />
      <path d="M15.5 17c0 1 1.5 3 2 3 1.5 0 2.833-1.667 3.5-3 .667-1.667.5-5.833 0-7-1.5-3.5-3-4.5-3-4.5" />
      <path d="M8.5 17c0 1-1.356 3-1.832 3-1.429 0-2.698-1.667-3.333-3-.635-1.667-.476-5.833 0-7C4.762 6.5 6.258 5.5 6.258 5.5" />
      <path d="M12 4c-2.5 0-4.5.5-5.5 1.5-1.527 1.527-2.5 4.5-2 8.5 1 8 5.5 11 5.5 11s4.5-3 5.5-11c.5-4-1-7-2-8.5-1-1-3-1.5-5.5-1.5z" />
    </svg>
  )
}

export function SlackIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="3" height="8" x="13" y="2" rx="1.5" />
      <path d="M19 8.5V10h1.5A1.5 1.5 0 1 0 19 8.5" />
      <rect width="3" height="8" x="8" y="14" rx="1.5" />
      <path d="M5 15.5V14H3.5A1.5 1.5 0 1 0 5 15.5" />
      <rect width="8" height="3" x="14" y="13" rx="1.5" />
      <path d="M15.5 19H14v1.5a1.5 0 1 0 1.5-1.5" />
      <rect width="8" height="3" x="2" y="8" rx="1.5" />
      <path d="M8.5 5H10V3.5A1.5 1.5 0 1 0 8.5 5" />
    </svg>
  )
}

// PlatformIcon component that renders the appropriate icon based on the platform prop
export function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  switch (platform) {
    case "twitter":
      return <Twitter className={className} />
    case "linkedin":
      return <Linkedin className={className} />
    case "instagram":
      return <Instagram className={className} />
    case "email":
      return <Mail className={className} />
    case "reddit":
      return <RedditIcon className={className} />
    case "discord":
      return <DiscordIcon className={className} />
    case "slack":
      return <SlackIcon className={className} />
    default:
      return <MessageSquare className={className} />
  }
}
