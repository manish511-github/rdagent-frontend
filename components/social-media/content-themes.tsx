"use client"

import { Card } from "@/components/ui/card"
import { Hash } from "lucide-react"

interface ContentThemesProps {
	topics: string[]
	title?: string
}

export function ContentThemes({ topics, title = "Content Topics" }: ContentThemesProps) {
	return (
		<Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4 rounded-none">
			<div className="flex items-center gap-2 mb-3">
				<div className="p-1 bg-blue-50 dark:bg-blue-900/30 rounded-none">
					<Hash className="h-4 w-4 text-blue-600 dark:text-blue-400" />
				</div>
				<h4 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h4>
				<span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">{topics.length} topics</span>
			</div>
			<div className="flex flex-wrap gap-1">
				{topics.map((topic, index) => (
					<span
						key={index}
						className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 rounded-none"
					>
						{topic}
					</span>
				))}
			</div>
		</Card>
	)
}
