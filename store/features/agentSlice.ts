import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '../store'
import Cookies from 'js-cookie'
import { createSelector } from '@reduxjs/toolkit'

// Types
export type AgentType = 'twitter' | 'reddit' | 'mixed'

export type PostStatus = 'pending' | 'processed' | 'failed' | 'approved' | 'needs_review' | 'discarded' | 'escalated'

export interface TwitterPost {
  tweet_id: string
  text: string
  user_name: string
  user_screen_name: string
  retweet_count: number
  favorite_count: number
  relevance_score: number
  hashtags: string[]
  created_at: string
  status: PostStatus
}

export interface RedditPost {
  id: string
  author: string
  time: string
  status: PostStatus
  title: string
  content: string
  tag: string
  relevance: number
  sentiment: number
  keywords: string[]
  intent: string
  aiResponse: string
  aiConfidence: number
  comments: number
  upvotes: number
  url: string
  created_at: string
  subreddit: string
}

export interface ContentItem {
  id: string
  platform: string
  subreddit: string
  author: string
  time: string
  status: string
  title: string
  content: string
  tag: string
  relevance: number
  sentiment: string
  keywords: string[]
  intent: string
  aiResponse: string
  aiConfidence: number
  comments: number
  upvotes: number
  url: string
  post_id?: string
  post_title?: string
  post_body?: string
  post_url?: string
  relevance_score?: number
  sentiment_score?: number | null
  comment_draft?: string | null
  created_at?: string
}

export interface AgentData {
  id: string
  agent_name: string
  platform: AgentType
  description: string
  goals: string[]
  status: 'active' | 'paused' | 'completed' | 'error'
  created_at: string
  updated_at: string
  results: {
    posts?: RedditPost[]
    twitter_posts?: TwitterPost[]
  }
}

export interface AgentState {
  agentId: string | null
  name: string
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  agentType: AgentType
  redditPosts: RedditPost[]
  twitterPosts: TwitterPost[]
  agentStatus: 'active' | 'paused' | 'completed' | 'error'
  lastUpdated: string | null
  agentData: AgentData | null
}

// Unified interface for displaying posts in the UI
export interface DisplayPost {
  id: string
  platform: 'reddit' | 'twitter'
  author: string
  time: string
  status: PostStatus
  title: string
  content: string
  tag: string
  relevance: number
  sentiment: string
  keywords: string[]
  intent: string
  aiResponse: string
  aiConfidence: number
  comments: number
  upvotes: number
  url: string
  created_at: string
  subreddit?: string
}

const initialState: AgentState = {
  agentId: null,
  name: '',
  status: 'idle',
  error: null,
  agentType: 'mixed',
  redditPosts: [],
  twitterPosts: [],
  agentStatus: 'active',
  lastUpdated: null,
  agentData: null
}

interface AgentConnection {
  eventSource: EventSource
}

// Thunks
export const fetchAgentData = createAsyncThunk(
  'agent/fetchData',
  async (agentId: string, { rejectWithValue }) => {
    try {
      const token = Cookies.get('token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`http://localhost:8000/agents/${agentId}/results`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch agent data')
      }
      
      const data = await response.json()
      const agentData = data[0] // Get the first item from the response array
      
      console.log('Agent Data:', agentData) // Debug log
      console.log('Agent Platform:', agentData.results?.agent_platform) // Debug log

      // Determine agent type first
      let agentType: AgentType = 'mixed'
      if (agentData.results?.agent_platform === 'twitter') {
        agentType = 'twitter'
      } else if (agentData.results?.agent_platform === 'reddit') {
        agentType = 'reddit'
      }

      // Transform posts based on agent type
      let transformedRedditPosts: RedditPost[] = []
      let transformedTwitterPosts: TwitterPost[] = []

      if (agentType === 'twitter') {
        // For Twitter agents, transform posts into TwitterPost format
        transformedTwitterPosts = agentData.results?.posts?.map((post: any, index: number) => ({
          tweet_id: post.post_id || `twitter_${index}`,
          text: post.post_body || '',
          user_name: post.author || 'Unknown',
          user_screen_name: post.author || '',
          retweet_count: post.upvotes || 0,
          favorite_count: post.comments || 0,
          relevance_score: post.relevance_score || 0,
          hashtags: post.keywords || [],
          created_at: post.created_at,
          status: post.status || 'processed'
        })) || []
      } else if (agentType === 'reddit') {
        // For Reddit agents, transform posts into RedditPost format
        transformedRedditPosts = agentData.results?.posts?.map((post: any, index: number) => ({
          id: post.post_id || `reddit_${index}`,
          platform: 'reddit',
          subreddit: post.subreddit,
          author: post.author || 'Unknown',
          time: new Date(post.created_at).toLocaleString(),
          status: post.status || 'pending',
          title: post.post_title || '',
          content: post.post_body || '',
          tag: post.subreddit || '',
          relevance: Math.round((post.combined_relevance || 0) * 100),
          sentiment: post.sentiment_score || 0,
          keywords: post.keywords || [],
          intent: post.intent || 'Unknown',
          aiResponse: post.comment_draft || '',
          aiConfidence: post.ai_confidence || 0,
          comments: post.comments || 0,
          upvotes: post.upvotes || 0,
          url: post.post_url || '',
          created_at: post.created_at
        })) || []
      }

      console.log('Determined Agent Type:', agentType) // Debug log
      console.log('Transformed Twitter Posts:', transformedTwitterPosts) // Debug log
      console.log('Transformed Reddit Posts:', transformedRedditPosts) // Debug log

      // Return the transformed data
      return {
        id: agentData.id,
        agent_id: agentData.agent_id,
        project_id: agentData.project_id,
        status: agentData.status,
        error: agentData.error,
        created_at: agentData.created_at,
        platform: agentType,
        posts: transformedRedditPosts,
        twitter_posts: transformedTwitterPosts
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch agent data')
    }
  }
)

export const connectToAgent = createAsyncThunk(
  'agent/connect',
  async ({ projectId, agentId }: { projectId: string; agentId: string }, { rejectWithValue }) => {
    const token = Cookies.get('token')
    if (!token) {
      return rejectWithValue('Authentication required')
    }

    try {
      // Just return success, the EventSource will be handled in the component
      return { success: true }
    } catch (error) {
      return rejectWithValue('Failed to create connection')
    }
  }
)

export const updateAgentContent = createAsyncThunk(
  'agent/updateContent',
  async ({ redditPosts, twitterPosts }: { redditPosts: RedditPost[], twitterPosts: TwitterPost[] }) => {
    return { redditPosts, twitterPosts }
  }
)

export const updateAgentStatus = createAsyncThunk(
  'agent/updateStatus',
  async ({ agentId, status }: { agentId: string; status: 'active' | 'paused' | 'completed' | 'error' }, { rejectWithValue }) => {
    try {
      const token = Cookies.get('token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`http://localhost:8000/agents/${agentId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update agent status')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update agent status')
    }
  }
)

// Slice
const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {
    setAgentId: (state, action) => {
      state.agentId = action.payload
    },
    setAgentName: (state, action) => {
      state.name = action.payload
    },
    setAgentStatus: (state, action) => {
      state.agentStatus = action.payload
    },
    setAgentType: (state, action) => {
      state.agentType = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    updateAgentData: (state, action) => {
      state.agentData = action.payload
      state.name = action.payload.name
      state.agentType = action.payload.platform
      state.agentStatus = action.payload.status as 'active' | 'paused' | 'completed' | 'error'
      state.lastUpdated = new Date().toISOString()
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgentData.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchAgentData.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.agentId = action.payload.agent_id
        state.agentType = action.payload.platform
        state.redditPosts = action.payload.posts
        state.twitterPosts = action.payload.twitter_posts
        state.agentStatus = action.payload.status
        state.lastUpdated = new Date().toISOString()
        state.agentData = {
          id: action.payload.id,
          agent_name: state.name,
          platform: action.payload.platform,
          description: '',
          goals: [],
          status: action.payload.status,
          created_at: action.payload.created_at,
          updated_at: new Date().toISOString(),
          results: {
            posts: action.payload.posts,
            twitter_posts: action.payload.twitter_posts
          }
        }
      })
      .addCase(fetchAgentData.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
      .addCase(connectToAgent.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(connectToAgent.fulfilled, (state) => {
        state.status = 'succeeded'
      })
      .addCase(connectToAgent.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to connect to agent'
      })
      .addCase(updateAgentContent.fulfilled, (state, action) => {
        state.redditPosts = action.payload.redditPosts
        state.twitterPosts = action.payload.twitterPosts
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(updateAgentStatus.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(updateAgentStatus.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.agentStatus = action.payload.status
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(updateAgentStatus.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
  }
})

// Actions
export const { 
  setAgentId, 
  setAgentName, 
  setAgentStatus, 
  setAgentType,
  clearError, 
  updateAgentData 
} = agentSlice.actions

// Selectors
export const selectAgentId = (state: RootState) => state.agent.agentId
export const selectAgentName = (state: RootState) => state.agent.name
export const selectAgentStatus = (state: RootState) => state.agent.status
export const selectAgentError = (state: RootState) => state.agent.error
export const selectAgentType = (state: RootState) => state.agent.agentType
export const selectRedditPosts = (state: RootState) => state.agent.redditPosts
export const selectTwitterPosts = (state: RootState) => state.agent.twitterPosts
export const selectAgentState = (state: RootState) => state.agent.agentStatus
export const selectLastUpdated = (state: RootState) => state.agent.lastUpdated
export const selectAgentData = (state: RootState) => state.agent.agentData

// Memoized selector for display posts
export const selectDisplayPosts = createSelector(
  [(state: RootState) => state.agent.redditPosts, (state: RootState) => state.agent.twitterPosts],
  (redditPosts, twitterPosts) => {
    const transformedRedditPosts = redditPosts.map(post => ({
      id: `reddit_${post.id}`,
      platform: 'reddit' as const,
      author: post.author,
      time: post.time,
      status: post.status,
      title: post.title,
      content: post.content,
      tag: post.tag,
      relevance: post.relevance,
      sentiment: post.sentiment > 0 ? 'positive' : post.sentiment < 0 ? 'negative' : 'neutral',
      keywords: post.keywords,
      intent: post.intent,
      aiResponse: post.aiResponse,
      aiConfidence: post.aiConfidence,
      comments: post.comments,
      upvotes: post.upvotes,
      url: post.url,
      created_at: post.created_at,
      subreddit: post.subreddit
    }))

    const transformedTwitterPosts = twitterPosts.map(post => ({
      id: `twitter_${post.tweet_id}`,
      platform: 'twitter' as const,
      author: post.user_name,
      time: new Date(post.created_at).toISOString(),
      status: post.status || 'processed',
      title: '',
      content: post.text,
      tag: post.hashtags.join(', '),
      relevance: post.relevance_score,
      sentiment: 'neutral',
      keywords: post.hashtags,
      intent: 'Unknown',
      aiResponse: '',
      aiConfidence: 0,
      comments: 0,
      upvotes: post.favorite_count,
      url: `https://twitter.com/${post.user_screen_name}/status/${post.tweet_id}`,
      created_at: post.created_at
    }))

    return [...transformedRedditPosts, ...transformedTwitterPosts]
  }
)

export default agentSlice.reducer 