import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '../store'
import Cookies from 'js-cookie'

// Types
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
  platform: string
  description: string
  goals: string[]
  status: 'active' | 'paused' | 'completed' | 'error'
  created_at: string
  updated_at: string
  results: {
    posts: Array<{
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
      sentiment: number
      keywords: string[]
      intent: string
      aiResponse: string
      aiConfidence: number
      comments: number
      upvotes: number
      url: string
      post_id: string
      post_title: string
      post_body: string
      post_url: string
      relevance_score: number
      sentiment_score: number
      comment_draft: string
      created_at: string
    }>
  }
}

export interface AgentState {
  agentId: string | null
  name: string
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  contentItems: ContentItem[]
  agentStatus: 'active' | 'paused' | 'completed' | 'error'
  lastUpdated: string | null
  agentData: AgentData | null
}

const initialState: AgentState = {
  agentId: null,
  name: '',
  status: 'idle',
  error: null,
  contentItems: [],
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
      // Transform the data to match our ContentItem interface
      const transformedPosts = data[0].results.posts.map((post: any, index: number) => ({
        id: `${post.post_id}_${index}`, // Make ID unique by combining post_id with index
        platform: 'reddit',
        subreddit: post.subreddit,
        author: 'Unknown', // API doesn't provide author
        time: new Date(post.created_at).toLocaleString(),
        status: post.status || 'pending',
        title: post.post_title,
        content: post.post_body,
        tag: post.subreddit,
        relevance: Math.round(post.relevance_score * 100),
        sentiment: post.sentiment_score ? (post.sentiment_score > 0 ? 'positive' : post.sentiment_score < 0 ? 'negative' : 'neutral') : 'neutral',
        keywords: [], // API doesn't provide keywords
        intent: 'Unknown', // API doesn't provide intent
        aiResponse: post.comment_draft,
        aiConfidence: 0, // API doesn't provide confidence
        comments: 0, // API doesn't provide comments count
        upvotes: 0, // API doesn't provide upvotes count
        url: post.post_url,
        post_id: post.post_id,
        post_title: post.post_title,
        post_body: post.post_body,
        post_url: post.post_url,
        relevance_score: post.relevance_score,
        sentiment_score: post.sentiment_score,
        comment_draft: post.comment_draft,
        created_at: post.created_at
      }))

      return {
        ...data[0].results,
        posts: transformedPosts
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
  async (contentItems: ContentItem[]) => {
    return contentItems
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
    clearError: (state) => {
      state.error = null
    },
    updateAgentData: (state, action) => {
      state.agentData = action.payload
      state.name = action.payload.name
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
        state.agentData = action.payload
        state.contentItems = action.payload.posts
        state.name = action.payload.name
        state.agentStatus = action.payload.status as 'active' | 'paused' | 'completed' | 'error'
        state.lastUpdated = new Date().toISOString()
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
        state.contentItems = action.payload
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
export const { setAgentId, setAgentName, setAgentStatus, clearError, updateAgentData } = agentSlice.actions

// Selectors
export const selectAgentId = (state: RootState) => state.agent.agentId
export const selectAgentName = (state: RootState) => state.agent.name
export const selectAgentStatus = (state: RootState) => state.agent.status
export const selectAgentError = (state: RootState) => state.agent.error
export const selectContentItems = (state: RootState) => state.agent.contentItems
export const selectAgentState = (state: RootState) => state.agent.agentStatus
export const selectLastUpdated = (state: RootState) => state.agent.lastUpdated
export const selectAgentData = (state: RootState) => state.agent.agentData

export default agentSlice.reducer 