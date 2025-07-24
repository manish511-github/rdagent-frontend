"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, Sparkles } from "lucide-react";
import Cookies from "js-cookie";

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

export default function ResponseComposer({
  post,
  agentId,
  onSend,
}: ResponseComposerProps) {
  const [response, setResponse] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    // Replace with your actual AI call
    let token = Cookies.get("access_token");
    const aiResponse = await fetch(
      "http://localhost:8000/reddit/generate-reply",
      {
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
      }
    ).then((r) => r.json());
    console.log(aiResponse);
    setResponse(aiResponse.reply || "");
    setGenerating(false);
  };

  const handleSend = () => {
    if (!response.trim()) return;
    onSend?.(response);
    setResponse("");
  };

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
                <Sparkles className="h-3 w-3 animate-spin mr-1" />
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
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          className="text-sm resize-none"
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Posting as <strong>HexnodeBot</strong>
          </span>

          <Button
            size="sm"
            className="h-7 text-xs"
            onClick={handleSend}
            disabled={!response.trim()}
          >
            <Send className="h-3 w-3 mr-1" />
            Send Reply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
