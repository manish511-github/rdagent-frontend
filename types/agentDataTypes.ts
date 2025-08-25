export interface HackerNewsPostType {
  story_id: string;
  title: string;
  text: string | null;
  url: string | null;
  score: number;
  time: number;
  created_utc: string;
  comment_count: number;
  children: number[];
  execution_id: number;
  relevance_score: number;
  keyword_relevance: number | null;
  semantic_relevance: number | null;
  combined_relevance: number | null;
  llm_relevance: number | null;
  matched_query: string | null;
  sort_method: string | null;
  summary: string | null;
  status: string;
  analysis_created_at: string;
  relevant_comments: HackerNewsCommentType[];
}

export interface HackerNewsCommentType {
  comment_id: string;
  text: string;
  time: number | null;
  created_utc: string | null;
  children: number[];
  execution_id: number;
  relevance_score: number | null;
  keyword_relevance: number | null;
  semantic_relevance: number | null;
  combined_relevance: number | null;
  llm_relevance: number | null;
  matched_query: string | null;
  sort_method: string | null;
  summary: string | null;
  status: string;
  analysis_created_at: string;
  relevant_comments: HackerNewsCommentType[];
}
