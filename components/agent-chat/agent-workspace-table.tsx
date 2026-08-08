"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Columns3,
  Download,
  ExternalLink,
  List,
  Loader2,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Table2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type {
  AgentWorkspaceColumn,
  AgentColumnRunProgress,
  AgentWorkspaceCellState,
  AgentWorkspaceRow,
  AgentWorkspaceTablePage,
  AgentWorkspaceTableSummary,
} from "@/lib/agent-chat/types";

function valueText(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "string") return value || "—";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function isUrl(value: unknown): value is string {
  return (
    typeof value === "string" &&
    (/^https?:\/\//i.test(value) || /^www\./i.test(value))
  );
}

function displayScalar(value: unknown): ReactNode {
  if (isUrl(value)) {
    const href = /^www\./i.test(value) ? `https://${value}` : value;
    const label = value.replace(/^https?:\/\//i, "").replace(/\/$/, "");
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex max-w-full items-center gap-1 truncate text-blue-600 hover:underline"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="truncate">{label}</span>
        <ExternalLink className="size-3 shrink-0" />
      </a>
    );
  }
  return valueText(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isDisplayableScalar(value: unknown): boolean {
  return (
    (typeof value === "string" && value.trim().length > 0) ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

/**
 * Resolve the concise value shown in a grid cell.
 *
 * Object columns declare their preferred label through ``main_field``. For
 * example, a calculated contact object can store name, title, LinkedIn URL,
 * status, and provenance while the grid displays only its configured name.
 * The fallback is schema-agnostic: use the first non-empty scalar property.
 */
function compactColumnValue(
  value: unknown,
  column: AgentWorkspaceColumn
): unknown {
  if (!isRecord(value)) return value;

  if (column.main_field) {
    const primary = value[column.main_field];
    if (isDisplayableScalar(primary)) return primary;
    // A configured primary field is also the empty-state contract. Do not
    // accidentally substitute a domain, status code, or provenance sentence
    // when the actual display value is missing.
    return null;
  }

  for (const propertyValue of Object.values(value)) {
    if (isDisplayableScalar(propertyValue)) return propertyValue;
  }
  return null;
}

function fieldLabel(key: string): string {
  return key
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function ColumnValue({
  value,
  column,
  expanded = false,
}: {
  value: unknown;
  column: AgentWorkspaceColumn;
  expanded?: boolean;
}) {
  if (Array.isArray(value)) {
    if (value.length === 0) return <>—</>;
    if (!expanded) {
      return (
        <span className="inline-flex max-w-full items-center gap-1.5">
          <span className="truncate">{valueText(value[0])}</span>
          {value.length > 1 ? (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              +{value.length - 1}
            </span>
          ) : null}
        </span>
      );
    }
    return (
      <div className="space-y-1.5">
        {value.map((item, index) => (
          <div key={index} className="rounded-md border border-border/70 bg-muted/20 p-2">
            {isRecord(item) ? valueText(item) : displayScalar(item)}
          </div>
        ))}
      </div>
    );
  }
  if (!expanded || !isRecord(value)) {
    return displayScalar(compactColumnValue(value, column));
  }

  const entries = Object.entries(value);
  if (entries.length === 0) return <>—</>;

  // Put the schema-declared primary field first while preserving the
  // provider/model-defined order for every other field.
  const orderedEntries = column.main_field
    ? entries.toSorted(([left], [right]) => {
        if (left === column.main_field) return -1;
        if (right === column.main_field) return 1;
        return 0;
      })
    : entries;

  return (
    <div className="space-y-2 rounded-md border border-border/70 bg-muted/20 p-2.5">
      {orderedEntries.map(([key, propertyValue]) => (
        <div key={key} className="grid grid-cols-[minmax(0,5.5rem)_minmax(0,1fr)] gap-2">
          <span className="text-[10px] font-medium text-muted-foreground">
            {fieldLabel(key)}
          </span>
          <span className="min-w-0 break-words text-xs text-foreground">
            {isRecord(propertyValue) || Array.isArray(propertyValue)
              ? valueText(propertyValue)
              : displayScalar(propertyValue)}
          </span>
        </div>
      ))}
    </div>
  );
}

function cellErrorMessage(cell: AgentWorkspaceCellState | undefined): string {
  const message = cell?.error?.message;
  return typeof message === "string" && message
    ? message
    : "This value could not be calculated.";
}

function DynamicCell({
  row,
  column,
  expanded = false,
  disabled,
  onRetry,
}: {
  row: AgentWorkspaceRow;
  column: AgentWorkspaceColumn;
  expanded?: boolean;
  disabled: boolean;
  onRetry: (row: AgentWorkspaceRow, column: AgentWorkspaceColumn) => void;
}) {
  const cell = row.cells?.[column.slug];
  const value = row.values[column.slug];
  if (cell?.status === "running") {
    return (
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <Loader2 className="size-3 animate-spin" />
        Calculating…
      </span>
    );
  }
  if (cell?.status === "failed") {
    return (
      <span className="inline-flex max-w-full items-center gap-2">
        <span className="truncate text-rose-600" title={cellErrorMessage(cell)}>
          Couldn&apos;t calculate
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 shrink-0 gap-1 px-1.5 text-[10px]"
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
            onRetry(row, column);
          }}
        >
          <RotateCcw className="size-3" />
          Retry
        </Button>
      </span>
    );
  }
  if (cell?.status === "succeeded" && compactColumnValue(value, column) == null) {
    return <span className="text-muted-foreground">No match</span>;
  }
  return <ColumnValue value={value} column={column} expanded={expanded} />;
}

function primaryRowLabel(row: AgentWorkspaceRow, columns: AgentWorkspaceColumn[]) {
  const preferred = columns.find((column) =>
    /(^|[-_])(company|person|name|title)([-_]|$)/i.test(column.slug)
  );
  return valueText(preferred ? row.values[preferred.slug] : row.source_key);
}

function escapeCsv(value: unknown): string {
  const text = valueText(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function AgentWorkspaceTable({
  tables,
  activeTableSlug,
  activeTable,
  isLoading,
  isStreaming,
  runProgress,
  error,
  onSelectTable,
  onRetryCell,
}: {
  tables: AgentWorkspaceTableSummary[];
  activeTableSlug: string | null;
  activeTable: AgentWorkspaceTablePage | null;
  isLoading: boolean;
  isStreaming: boolean;
  runProgress?: AgentColumnRunProgress;
  error: string | null;
  onSelectTable: (slug: string) => void;
  onRetryCell: (input: {
    tableSlug: string;
    tableName: string;
    row: AgentWorkspaceRow;
    column: AgentWorkspaceColumn;
  }) => void;
}) {
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "table">("table");
  const [selectedRow, setSelectedRow] = useState<AgentWorkspaceRow | null>(null);

  const columns = activeTable?.columns || [];
  const rows = activeTable?.rows || [];
  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) =>
      [row.source_key, row.qualification_status, ...Object.values(row.values)]
        .map(valueText)
        .some((value) => value.toLowerCase().includes(needle))
    );
  }, [query, rows]);

  useEffect(() => {
    if (!selectedRow) return;
    setSelectedRow(rows.find((row) => row.id === selectedRow.id) || null);
  }, [rows, selectedRow?.id]);

  const exportCsv = () => {
    if (!activeTable) return;
    const header = columns.map((column) => escapeCsv(column.name)).join(",");
    const body = rows
      .map((row) =>
        columns.map((column) => escapeCsv(row.values[column.slug])).join(",")
      )
      .join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${activeTable.table.slug}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const retryCell = (row: AgentWorkspaceRow, column: AgentWorkspaceColumn) => {
    if (!activeTable) return;
    onRetryCell({
      tableSlug: activeTable.table.slug,
      tableName: activeTable.table.name,
      row,
      column,
    });
  };

  if (tables.length === 0 && !isLoading) return null;

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col bg-white dark:bg-black">
      <div className="flex h-11 shrink-0 items-end gap-1 overflow-x-auto border-b border-border px-3">
        {tables.map(({ table, row_count: rowCount }, index) => {
          const active = table.slug === activeTableSlug;
          return (
            <button
              key={table.public_id}
              type="button"
              onClick={() => {
                setSelectedRow(null);
                onSelectTable(table.slug);
              }}
              className={`group relative flex h-10 shrink-0 items-center gap-2 px-3 text-xs transition-colors ${
                active
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="max-w-44 truncate">{table.name}</span>
              <span className="tabular-nums text-muted-foreground">{rowCount}</span>
              {(isStreaming && (active || index === 0)) || isLoading ? (
                <span className="size-1.5 rounded-full bg-emerald-500" />
              ) : null}
              {active ? (
                <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-blue-600" />
              ) : null}
            </button>
          );
        })}
        <Button type="button" variant="ghost" size="icon" className="mb-1 size-8 shrink-0" disabled>
          <Plus className="size-4" />
          <span className="sr-only">Create table</span>
        </Button>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-base font-semibold">
              {activeTable?.table.name || "Loading table…"}
            </h2>
            {isStreaming || isLoading ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Live updating
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {runProgress?.status === "running" && runProgress.totalCells > 0
              ? `${runProgress.processedCells} of ${runProgress.totalCells} cells updated`
              : activeTable
                ? `${activeTable.total} rows · ${columns.length} columns`
                : "Reading workspace"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <div className="flex rounded-md border border-border p-0.5">
            <Button
              type="button"
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 gap-1.5 px-2"
              onClick={() => setViewMode("list")}
            >
              <List className="size-3.5" />
              List
            </Button>
            <Button
              type="button"
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 gap-1.5 px-2"
              onClick={() => setViewMode("table")}
            >
              <Table2 className="size-3.5" />
              Table
            </Button>
          </div>
          <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5" disabled>
            <SlidersHorizontal className="size-3.5" />
            Filters
          </Button>
          <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5" disabled>
            <Columns3 className="size-3.5" />
            Columns
          </Button>
          <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5" onClick={exportCsv} disabled={!activeTable}>
            <Download className="size-3.5" />
            Export
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>Rename table</DropdownMenuItem>
              <DropdownMenuItem disabled>Duplicate table</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>Close table</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex shrink-0 items-center border-b border-border px-3 py-2">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search this table…"
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            {isLoading && !activeTable ? (
              <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading leads…
              </div>
            ) : error ? (
              <div className="p-4 text-sm text-destructive">{error}</div>
            ) : activeTable && viewMode === "table" ? (
              <table className="w-full min-w-max border-collapse text-left text-xs">
                <thead className="sticky top-0 z-10 bg-muted/70 backdrop-blur">
                  <tr>
                    <th className="w-10 border-b border-border px-3 py-2 font-medium text-muted-foreground">#</th>
                    {columns.map((column) => (
                      <th
                        key={column.slug}
                        className="min-w-36 border-b border-border px-3 py-2 font-medium text-foreground"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          {column.name}
                          {column.required ? <span className="size-1 rounded-full bg-blue-500" /> : null}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, rowIndex) => {
                    const selected = selectedRow?.id === row.id;
                    return (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedRow(row)}
                        className={`cursor-pointer border-b border-border/70 transition-colors hover:bg-muted/40 ${
                          selected ? "bg-blue-50 dark:bg-blue-950/30" : ""
                        }`}
                      >
                        <td className={`px-3 py-2.5 tabular-nums text-muted-foreground ${selected ? "border-l-2 border-blue-600" : ""}`}>
                          {rowIndex + 1}
                        </td>
                        {columns.map((column) => (
                          <td key={column.slug} className="max-w-64 px-3 py-2.5 text-foreground">
                            <div
                              className="truncate"
                              title={valueText(
                                compactColumnValue(row.values[column.slug], column)
                              )}
                            >
                              <DynamicCell
                                row={row}
                                column={column}
                                disabled={isStreaming}
                                onRetry={retryCell}
                              />
                            </div>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : activeTable ? (
              <div className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredRows.map((row) => (
                  <article
                    key={row.id}
                    className="rounded-lg border border-border bg-background p-3 shadow-sm transition-colors hover:border-blue-300"
                  >
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => setSelectedRow(row)}
                    >
                      <p className="truncate text-sm font-semibold">
                        {primaryRowLabel(row, columns)}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {row.source_key}
                      </p>
                    </button>
                    <dl className="mt-3 space-y-2.5">
                      {columns.map((column) => (
                        <div key={column.slug} className="grid grid-cols-[minmax(0,6rem)_minmax(0,1fr)] gap-2">
                          <dt className="truncate text-[10px] font-medium text-muted-foreground">
                            {column.name}
                          </dt>
                          <dd className="min-w-0 truncate text-xs">
                            <DynamicCell
                              row={row}
                              column={column}
                              disabled={isStreaming}
                              onRetry={retryCell}
                            />
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </article>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex h-10 shrink-0 items-center justify-between border-t border-border px-4 text-xs text-muted-foreground">
            <span>
              Showing {filteredRows.length} of {activeTable?.total || 0}
            </span>
            {isStreaming ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600">
                <Loader2 className="size-3 animate-spin" />
                Adding results
              </span>
            ) : null}
          </div>
        </div>

        {selectedRow ? (
          <aside className="flex w-72 shrink-0 flex-col border-l border-border bg-background">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {primaryRowLabel(selectedRow, columns)}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">{selectedRow.source_key}</p>
              </div>
              <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => setSelectedRow(null)}>
                <X className="size-4" />
                <span className="sr-only">Close details</span>
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
              <dl className="space-y-4">
                {columns.map((column) => (
                  <div key={column.slug}>
                    <dt className="text-[11px] font-medium text-muted-foreground">{column.name}</dt>
                    <dd className="mt-1 break-words text-xs text-foreground">
                      <DynamicCell
                        row={selectedRow}
                        column={column}
                        expanded
                        disabled={isStreaming}
                        onRetry={retryCell}
                      />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
