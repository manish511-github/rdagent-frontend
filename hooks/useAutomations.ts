"use client";

import { useCallback, useEffect, useState } from "react";

import {
  confirmAgentAutomation,
  getAgentAutomation,
  listAgentAutomations,
  updateAgentAutomation,
} from "@/lib/agent-chat/api";
import type {
  AgentAutomationAction,
  AgentAutomationLibraryItem,
  AgentAutomationTask,
} from "@/lib/agent-chat/types";

function replaceTask(
  items: AgentAutomationLibraryItem[],
  task: AgentAutomationTask
): AgentAutomationLibraryItem[] {
  return items.map((item) =>
    item.task.slug === task.slug ? { ...item, task } : item
  );
}

export function useAutomations({ enabled = true }: { enabled?: boolean } = {}) {
  const [items, setItems] = useState<AgentAutomationLibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSlug, setActionSlug] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      setItems(await listAgentAutomations());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to load automations");
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const pause = useCallback(async (slug: string) => {
    if (actionSlug) return;
    setActionSlug(slug);
    setError(null);
    try {
      const fresh = await getAgentAutomation(slug);
      const result = await updateAgentAutomation(slug, {
        expected_version: fresh.version,
        pause: true,
      });
      setItems((current) => replaceTask(current, result.task));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to pause automation");
      throw caught;
    } finally {
      setActionSlug(null);
    }
  }, [actionSlug]);

  const confirm = useCallback(async (slug: string, action: AgentAutomationAction) => {
    if (actionSlug) return null;
    setActionSlug(slug);
    setError(null);
    try {
      const fresh = await getAgentAutomation(slug);
      const result = await confirmAgentAutomation(slug, {
        expected_version: fresh.version,
        action,
        confirmed: true,
      });
      // Run-now creates a new durable occurrence. Reload once so its queued
      // state and latest-run metadata become visible in this same row.
      if (action === "run_now") {
        setItems(await listAgentAutomations());
      } else {
        setItems((current) => replaceTask(current, result.task));
      }
      return result;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Automation action failed");
      throw caught;
    } finally {
      setActionSlug(null);
    }
  }, [actionSlug]);

  return {
    items,
    isLoading,
    error,
    actionSlug,
    refresh,
    pause,
    confirm,
  };
}
