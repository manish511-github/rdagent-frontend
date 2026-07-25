"use client";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import type { LucideIcon } from "lucide-react";
import { BrainIcon, ChevronDownIcon, DotIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { createContext, memo, useContext, useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface ChainOfThoughtContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const ChainOfThoughtContext = createContext<ChainOfThoughtContextValue | null>(
  null
);

function useChainOfThought() {
  const context = useContext(ChainOfThoughtContext);
  if (!context) {
    throw new Error(
      "ChainOfThought components must be used within ChainOfThought"
    );
  }
  return context;
}

export type ChainOfThoughtProps = ComponentProps<"div"> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const ChainOfThought = memo(function ChainOfThought({
  className,
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: ChainOfThoughtProps) {
  const [isOpen, setIsOpen] = useControllableState({
    defaultProp: defaultOpen,
    onChange: onOpenChange,
    prop: open,
  });
  const value = useMemo(() => ({ isOpen, setIsOpen }), [isOpen, setIsOpen]);

  return (
    <ChainOfThoughtContext.Provider value={value}>
      <div className={cn("not-prose w-full space-y-2", className)} {...props}>
        {children}
      </div>
    </ChainOfThoughtContext.Provider>
  );
});

export type ChainOfThoughtHeaderProps = ComponentProps<
  typeof CollapsibleTrigger
>;

export const ChainOfThoughtHeader = memo(function ChainOfThoughtHeader({
  className,
  children,
  ...props
}: ChainOfThoughtHeaderProps) {
  const { isOpen, setIsOpen } = useChainOfThought();
  return (
    <Collapsible onOpenChange={setIsOpen} open={isOpen}>
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
          className
        )}
        {...props}
      >
        <BrainIcon className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left">
          {children ?? "Activity"}
        </span>
        <ChevronDownIcon
          className={cn(
            "size-4 shrink-0 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
    </Collapsible>
  );
});

export type ChainOfThoughtStepProps = ComponentProps<"div"> & {
  icon?: LucideIcon;
  label: ReactNode;
  description?: ReactNode;
  status?: "complete" | "active" | "pending";
};

const stepStatusStyles = {
  active: "text-foreground",
  complete: "text-muted-foreground",
  pending: "text-muted-foreground/50",
};

export const ChainOfThoughtStep = memo(function ChainOfThoughtStep({
  className,
  icon: Icon = DotIcon,
  label,
  description,
  status = "complete",
  children,
  ...props
}: ChainOfThoughtStepProps) {
  return (
    <div
      className={cn(
        "flex gap-2 text-sm fade-in-0 slide-in-from-top-2 animate-in",
        stepStatusStyles[status],
        className
      )}
      {...props}
    >
      <div className="relative mt-0.5">
        <Icon className={cn("size-4", status === "active" && "animate-pulse")} />
        <div className="absolute bottom-[-0.75rem] left-1/2 top-6 -mx-px w-px bg-border" />
      </div>
      <div className="min-w-0 flex-1 space-y-1.5 overflow-hidden pb-1">
        <div className="break-words">{label}</div>
        {description && (
          <div className="break-words text-xs text-muted-foreground">
            {description}
          </div>
        )}
        {children}
      </div>
    </div>
  );
});

export const ChainOfThoughtSearchResults = memo(function ChainOfThoughtSearchResults({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      {...props}
    />
  );
});

export const ChainOfThoughtSearchResult = memo(function ChainOfThoughtSearchResult({
  className,
  children,
  ...props
}: ComponentProps<typeof Badge>) {
  return (
    <Badge
      className={cn(
        "max-w-full gap-1 truncate px-2 py-0.5 text-xs font-normal",
        className
      )}
      variant="secondary"
      {...props}
    >
      {children}
    </Badge>
  );
});

export const ChainOfThoughtContent = memo(function ChainOfThoughtContent({
  className,
  children,
  ...props
}: ComponentProps<typeof CollapsibleContent>) {
  const { isOpen } = useChainOfThought();
  return (
    <Collapsible open={isOpen}>
      <CollapsibleContent
        className={cn(
          "mt-2 space-y-3 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:animate-in data-[state=open]:slide-in-from-top-2",
          className
        )}
        {...props}
      >
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
});
