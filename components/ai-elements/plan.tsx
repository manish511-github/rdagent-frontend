"use client";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { ChevronsUpDownIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { createContext, useContext, useMemo } from "react";

import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type PlanContextValue = {
  isStreaming: boolean;
};

const PlanContext = createContext<PlanContextValue | null>(null);

function usePlan() {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error("Plan components must be used within Plan");
  }
  return context;
}

export type PlanProps = ComponentProps<typeof Collapsible> & {
  isStreaming?: boolean;
};

export function Plan({
  className,
  isStreaming = false,
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: PlanProps) {
  const [isOpen, setIsOpen] = useControllableState<boolean>({
    defaultProp: defaultOpen,
    onChange: onOpenChange,
    prop: open,
  });
  const value = useMemo(() => ({ isStreaming }), [isStreaming]);

  return (
    <PlanContext.Provider value={value}>
      <Collapsible
        data-slot="plan"
        onOpenChange={setIsOpen}
        open={isOpen}
        {...props}
      >
        <Card className={cn("overflow-hidden shadow-sm", className)}>
          {children}
        </Card>
      </Collapsible>
    </PlanContext.Provider>
  );
}

export type PlanHeaderProps = ComponentProps<typeof CardHeader>;

export function PlanHeader({ className, ...props }: PlanHeaderProps) {
  return (
    <CardHeader
      className={cn("flex-row items-start justify-between gap-3 p-4", className)}
      data-slot="plan-header"
      {...props}
    />
  );
}

export type PlanTitleProps = Omit<
  ComponentProps<typeof CardTitle>,
  "children"
> & {
  children: string;
};

export function PlanTitle({ children, className, ...props }: PlanTitleProps) {
  const { isStreaming } = usePlan();

  return (
    <CardTitle
      className={cn("truncate text-sm font-medium leading-5", className)}
      data-slot="plan-title"
      {...props}
    >
      {isStreaming ? <Shimmer>{children}</Shimmer> : children}
    </CardTitle>
  );
}

export type PlanDescriptionProps = Omit<
  ComponentProps<typeof CardDescription>,
  "children"
> & {
  children: string;
};

export function PlanDescription({
  children,
  className,
  ...props
}: PlanDescriptionProps) {
  const { isStreaming } = usePlan();

  return (
    <CardDescription
      className={cn("line-clamp-2 text-xs leading-5", className)}
      data-slot="plan-description"
      {...props}
    >
      {isStreaming ? <Shimmer>{children}</Shimmer> : children}
    </CardDescription>
  );
}

export type PlanActionProps = ComponentProps<"div">;

export function PlanAction({ className, ...props }: PlanActionProps) {
  return (
    <div
      className={cn("flex shrink-0 items-center gap-2", className)}
      data-slot="plan-action"
      {...props}
    />
  );
}

export type PlanContentProps = ComponentProps<typeof CardContent>;

export function PlanContent({ className, ...props }: PlanContentProps) {
  return (
    <CollapsibleContent asChild>
      <CardContent
        className={cn("border-t px-4 py-3", className)}
        data-slot="plan-content"
        {...props}
      />
    </CollapsibleContent>
  );
}

export type PlanFooterProps = ComponentProps<typeof CardFooter>;

export function PlanFooter({ className, ...props }: PlanFooterProps) {
  return (
    <CardFooter
      className={cn("justify-end gap-2 border-t px-3 py-2", className)}
      data-slot="plan-footer"
      {...props}
    />
  );
}

export type PlanTriggerProps = ComponentProps<typeof Button>;

export function PlanTrigger({ className, ...props }: PlanTriggerProps) {
  return (
    <CollapsibleTrigger asChild>
      <Button
        className={cn("size-8", className)}
        data-slot="plan-trigger"
        size="icon"
        type="button"
        variant="ghost"
        {...props}
      >
        <ChevronsUpDownIcon className="size-4" />
        <span className="sr-only">Toggle plan</span>
      </Button>
    </CollapsibleTrigger>
  );
}
