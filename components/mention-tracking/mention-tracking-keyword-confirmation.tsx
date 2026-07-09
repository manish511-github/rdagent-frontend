"use client";

import { useMemo, useState } from "react";
import { Check, Loader2, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MentionKeywordPlan } from "@/lib/mention-tracking/types";
import { normalizeKeywords } from "@/lib/mention-tracking/skill-utils";

type MentionTrackingKeywordConfirmationProps = {
  plan: MentionKeywordPlan;
  disabled: boolean;
  onConfirm: (message: string, keywords: string[]) => void;
};

export function MentionTrackingKeywordConfirmation({
  plan,
  disabled,
  onConfirm,
}: MentionTrackingKeywordConfirmationProps) {
  const initialKeywords = useMemo(
    () => normalizeKeywords(plan.extracted_keywords),
    [plan.extracted_keywords]
  );
  const suggestedKeywords = useMemo(
    () =>
      normalizeKeywords(plan.suggested_keywords).filter(
        (keyword) =>
          !initialKeywords.some(
            (initialKeyword) =>
              initialKeyword.toLowerCase() === keyword.toLowerCase()
          )
      ),
    [initialKeywords, plan.suggested_keywords]
  );
  const [selectedKeywords, setSelectedKeywords] =
    useState<string[]>(initialKeywords);
  const [customKeyword, setCustomKeyword] = useState("");

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords((current) => {
      const exists = current.some(
        (item) => item.toLowerCase() === keyword.toLowerCase()
      );
      if (exists) {
        return current.filter(
          (item) => item.toLowerCase() !== keyword.toLowerCase()
        );
      }
      return [...current, keyword];
    });
  };

  const addCustomKeyword = () => {
    const keyword = customKeyword.trim();
    if (!keyword) return;
    setSelectedKeywords((current) => normalizeKeywords([...current, keyword]));
    setCustomKeyword("");
  };

  const selectableKeywords = [
    ...initialKeywords.map((keyword) => ({ keyword, source: "From prompt" })),
    ...suggestedKeywords.map((keyword) => ({ keyword, source: "Suggested" })),
  ];

  return (
    <div className="mt-4 rounded-lg border bg-secondary/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-medium">Final keywords</div>
          <div className="text-xs text-muted-foreground">
            Exact prompt keywords are selected. Add suggestions only if they fit.
          </div>
        </div>
        <Badge variant="outline">{selectedKeywords.length} selected</Badge>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {selectableKeywords.map(({ keyword, source }) => {
          const selected = selectedKeywords.some(
            (item) => item.toLowerCase() === keyword.toLowerCase()
          );
          return (
            <label
              key={`${source}-${keyword}`}
              className={`flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                selected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:border-primary/40"
              }`}
            >
              <input
                type="checkbox"
                checked={selected}
                disabled={disabled}
                onChange={() => toggleKeyword(keyword)}
                className="mt-0.5 size-4 rounded border-input"
              />
              <span className="min-w-0">
                <span className="block break-words font-medium">{keyword}</span>
                <span className="block text-[11px] text-muted-foreground">
                  {source}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={customKeyword}
          onChange={(event) => setCustomKeyword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addCustomKeyword();
            }
          }}
          placeholder="Add a keyword or exact phrase"
          className="min-h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
          disabled={disabled}
        />
        <Button
          type="button"
          variant="outline"
          onClick={addCustomKeyword}
          disabled={disabled || !customKeyword.trim()}
        >
          <Plus className="mr-2 size-4" />
          Add
        </Button>
      </div>

      {selectedKeywords.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {selectedKeywords.map((keyword) => (
            <Badge key={keyword} variant="secondary">
              {keyword}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <Button
          type="button"
          onClick={() => onConfirm(plan.message, selectedKeywords)}
          disabled={disabled || selectedKeywords.length === 0}
        >
          {disabled ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Check className="mr-2 size-4" />
          )}
          Track mentions
        </Button>
      </div>
    </div>
  );
}
