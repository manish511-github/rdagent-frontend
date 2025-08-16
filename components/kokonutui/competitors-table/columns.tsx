"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, RefreshCw, ExternalLink } from "lucide-react"

export type CompetitorRow = {
  name: string
  category: string
  description: string
  status?: string
  id?: number
  onDelete?: (id: number) => void
  onRefresh?: (id: number) => void
  onOpen?: (row: CompetitorRow) => void
  competitorSourceId?: string
  ourSourceId?: string
}

export const columns: ColumnDef<CompetitorRow>[] = [
  {
    accessorKey: "name",
    header: () => <span className="text-sm font-medium text-foreground">Name</span>,
    cell: ({ row }) => (
      <div className="font-medium text-xs flex items-center gap-2">
        {row.original.name}
        {row.original.status && (
          <Badge variant={row.original.status === 'completed' ? 'secondary' : 'outline'} className="text-[9px] h-4 px-1">
            {row.original.status}
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: () => <span className="text-sm font-medium text-foreground">Category</span>,
    cell: ({ row }) => <div className="text-xs text-muted-foreground">{row.original.category}</div>,
  },
  {
    accessorKey: "description",
    header: () => <span className="text-sm font-medium text-foreground">Description</span>,
    size: 500,
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground leading-relaxed line-clamp-2 max-w-[500px]" title={row.original.description}>
        {row.original.description}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <span className="text-sm font-medium text-foreground">Actions</span>,
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        {row.original.status === 'completed' && row.original.onOpen && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 text-blue-600 hover:text-blue-700"
            onClick={() => row.original.onOpen?.(row.original)}
            title="Open Analysis"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        )}
        {row.original.status === 'failed' && row.original.onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0"
            onClick={() => row.original.onRefresh?.(row.original.id!)}
            title="Retry"
          >
            <RefreshCw className="h-3 w-3 text-muted-foreground" />
          </Button>
        )}
        {row.original.onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 text-destructive hover:text-destructive"
            onClick={() => row.original.onDelete?.(row.original.id!)}
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    ),
  },
]

