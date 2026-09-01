"use client";

import { useCallback, useEffect, useState } from "react";

import {
  cancelAgentAutomationRun,
  confirmAgentAutomation,
  getAgentAutomation,
  getAgentAutomationDetail,
  updateAgentAutomation,
} from "@/lib/agent-chat/api";
import type {
  AgentAutomationAction,
  AgentAutomationDetail,
  AgentAutomationPatch,
} from "@/lib/agent-chat/types";

export function useAutomationDetail(
  slug: string,
  { enabled = true }: { enabled?: boolean } = {}
) {
  const [detail, setDetail] = useState<AgentAutomationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled || !slug) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      setDetail(await getAgentAutomationDetail(slug));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to load automation");
    } finally {
      setIsLoading(false);
    }
  }, [enabled, slug]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runAction = useCallback(
    async (key: string, action: () => Promise<unknown>) => {
      if (pendingAction) return;
      setPendingAction(key);
      setError(null);
      try {
        await action();
        setDetail(await getAgentAutomationDetail(slug));
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Automation action failed");
        throw caught;
      } finally {
        setPendingAction(null);
      }
    },
    [pendingAction, slug]
  );

  const confirm = useCallback(
    (action: AgentAutomationAction, patch?: AgentAutomationPatch) =>
      runAction(action, async () => {
        const fresh = await getAgentAutomation(slug);
        await confirmAgentAutomation(slug, {
          expected_version: fresh.version,
          action,
          confirmed: true,
          ...(patch ? { patch } : {}),
        });
      }),
    [runAction, slug]
  );

  const pause = useCallback(
    () =>
      runAction("pause", async () => {
        const fresh = await getAgentAutomation(slug);
        await updateAgentAutomation(slug, {
          expected_version: fresh.version,
          pause: true,
        });
      }),
    [runAction, slug]
  );

  const save = useCallback(
    (patch: AgentAutomationPatch) =>
      runAction("save", async () => {
        const fresh = await getAgentAutomation(slug);
        if (fresh.status === "active") {
          await confirmAgentAutomation(slug, {
            expected_version: fresh.version,
            action: "edit_live",
            confirmed: true,
            patch,
          });
        } else {
          await updateAgentAutomation(slug, {
            expected_version: fresh.version,
            patch,
          });
        }
      }),
    [runAction, slug]
  );

  const cancelRun = useCallback(
    (runId: string) =>
      runAction(`cancel:${runId}`, () => cancelAgentAutomationRun(slug, runId)),
    [runAction, slug]
  );

  return { detail, isLoading, pendingAction, error, refresh, confirm, pause, save, cancelRun };
}
