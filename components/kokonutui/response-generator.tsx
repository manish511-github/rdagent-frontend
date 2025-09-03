"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, Sparkles } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { AppDispatch, RootState } from "@/store/store";
import {
  setReplyDraft,
  setReplyGenerating,
  clearReplyDraft,
  selectReplyDraft,
  selectReplyGenerating,
  selectAgentOauthUsername,
  selectAgentOauthAccount,
} from "@/store/features/agentSlice";
import { selectAgents } from "@/store/slices/agentsSlice";
import Cookies from "js-cookie";
import { getApiUrl } from "../../lib/config";

export interface PostData {
  id: string;
  title: string;
  body: string;
  author: string;
  subreddit: string;
  url: string;
}

interface ResponseComposerProps {
  post: PostData;
  agentId: string;
  onSend?: (markdown: string) => void;
}

interface ReplyRequestBody {
  post_id: string;
  agent_id: number;
  message: string;
  oauth_account_id: number | string;
}

export default function ResponseComposer({
  post,
  agentId,
  onSend,
}: ResponseComposerProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [sending, setSending] = useState(false);

  // Use local state for textarea value to avoid Redux dispatches on every keystroke
  const [localResponse, setLocalResponse] = useState("");

  // Initialize local state with Redux state on first load
  const reduxResponse = useSelector(selectReplyDraft(post.id));
  const generating = useSelector(selectReplyGenerating(post.id));

  // Memoize expensive selector calls
  const oauthUsername = useSelector(selectAgentOauthUsername);
  const oauthAccount = useSelector(selectAgentOauthAccount);
  const agents = useSelector(selectAgents);

  // Memoize the fallback agent lookup
  const fallbackAgent = useMemo(
    () => agents.find((a) => a.id === parseInt(agentId)),
    [agents, agentId]
  );

  // Memoize final values
  const finalOauthUsername = useMemo(
    () => oauthUsername || fallbackAgent?.oauth_account?.provider_username,
    [oauthUsername, fallbackAgent]
  );

  const finalOauthAccountId = useMemo(
    () => oauthAccount?.id || fallbackAgent?.oauth_account?.id,
    [oauthAccount, fallbackAgent]
  );

  // Sync local state with Redux state on initial load
  useEffect(() => {
    if (reduxResponse && !localResponse) {
      setLocalResponse(reduxResponse);
    }
  }, [reduxResponse, localResponse]);

  const handleGenerate = useCallback(async () => {
    dispatch(setReplyGenerating({ postId: post.id, generating: true }));
    try {
      // Replace with your actual AI call
      let token = Cookies.get("access_token");
      const aiResponse = await fetch(getApiUrl("reddit/generate-reply"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: post.id,
          agent_id: parseInt(agentId),
          user_text: "",
        }),
      }).then((r) => r.json());
      console.log(aiResponse);
      const generatedReply = aiResponse.reply || "";
      // Update both local and Redux state
      setLocalResponse(generatedReply);
      dispatch(setReplyDraft({ postId: post.id, content: generatedReply }));
    } catch (error) {
      console.error("Failed to generate reply:", error);
    } finally {
      dispatch(setReplyGenerating({ postId: post.id, generating: false }));
    }
  }, [dispatch, post.id, agentId]);

  // Debounced Redux update
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const updateReduxDraft = useCallback(
    (content: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        dispatch(setReplyDraft({ postId: post.id, content }));
      }, 300); // 300ms debounce
    },
    [dispatch, post.id]
  );

  // Handle textarea changes - only update local state
  const handleTextChange = useCallback(
    (value: string) => {
      setLocalResponse(value);
      updateReduxDraft(value);
    },
    [updateReduxDraft]
  );

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleSend = useCallback(async () => {
    if (!localResponse.trim() || !finalOauthAccountId) return;

    setSending(true);
    try {
      const token = Cookies.get("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const requestBody: ReplyRequestBody = {
        post_id: post.id,
        agent_id: parseInt(agentId),
        message: localResponse.trim(),
        oauth_account_id: finalOauthAccountId,
      };

      const fetchResponse = await fetch(
        getApiUrl(`agents/reddit/${agentId}/reply`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!fetchResponse.ok) {
        const errorData = await fetchResponse.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to send reply");
      }

      const result = await fetchResponse.json();

      // Clear both local and Redux state after successful send
      setLocalResponse("");
      dispatch(clearReplyDraft({ postId: post.id }));

      // Call the onSend callback if provided
      onSend?.(requestBody.message);

      console.log("Reply sent successfully:", result);
    } catch (error) {
      console.error("Failed to send reply:", error);
      // You could add a toast notification here for error handling
    } finally {
      setSending(false);
    }
  }, [localResponse, finalOauthAccountId, post.id, agentId, dispatch, onSend]);

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Compose Response</Label>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <>
                <Sparkles className="h-3 w-3 mr-1" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 mr-1" />
                AI Draft
              </>
            )}
          </Button>
        </div>

        <Textarea
          rows={6}
          placeholder={`Reply to u/${post.author}…`}
          value={localResponse}
          onChange={(e) => handleTextChange(e.target.value)}
          className="text-sm resize-none"
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Posting as <strong>{finalOauthUsername || "Unknown User"}</strong>
          </span>

          <Button
            size="sm"
            className="h-7 text-xs"
            onClick={handleSend}
            disabled={!localResponse.trim() || sending}
          >
            {sending ? (
              <>
                <div className="h-3 w-3 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Sending…
              </>
            ) : (
              <>
                <Send className="h-3 w-3 mr-1" />
                Send Reply
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
