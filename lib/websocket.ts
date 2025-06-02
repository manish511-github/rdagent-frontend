import { QueryClient } from '@tanstack/react-query'

// Define Agent type here since we can't import it
type Agent = {
  id: string
  agent_name: string
  agent_platform: string
  agent_status: string
  goals: string
  instructions: string
  expectations: string
  project_id: string
  mode: string
  review_period: string
  review_minutes: string
  advanced_settings: Record<string, any>
  platform_settings: Record<string, any>
  created_at: string
}

type WebSocketMessage = {
  type: 'agent_status' | 'agent_update' | 'agent_metrics' | 'error'
  agent_id?: string
  status?: string
  data?: Partial<Agent>
  metrics?: Record<string, any>
  message?: string
}

type WebSocketError = {
  code: number
  reason: string
  timestamp: number
}

class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectTimeout: NodeJS.Timeout | null = null
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private baseDelay: number = 1000
  private maxDelay: number = 30000
  private queryClient: QueryClient
  private projectId: string | null = null
  private token: string | null = null
  private onErrorCallback: ((error: WebSocketError) => void) | null = null
  private onAuthErrorCallback: (() => void) | null = null

  constructor(queryClient: QueryClient, token: string) {
    this.queryClient = queryClient
    this.token = token
  }

  connect(projectId: string) {
    if (this.ws?.readyState === WebSocket.OPEN) return
    this.projectId = projectId

    try {
      const wsUrl = `ws://localhost:8000/ws/agents?token=${encodeURIComponent(this.token || '')}`
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = this.handleOpen.bind(this)
      this.ws.onmessage = this.handleMessage.bind(this)
      this.ws.onclose = this.handleClose.bind(this)
      this.ws.onerror = this.handleError.bind(this)
    } catch (error) {
      this.handleError({
        code: 1006, // Abnormal Closure
        reason: 'Failed to establish WebSocket connection',
        timestamp: Date.now()
      })
    }
  }

  private handleOpen() {
    console.log('WebSocket connected')
    this.reconnectAttempts = 0 // Reset reconnect attempts on successful connection
    
    if (this.projectId) {
      this.send({
        type: 'subscribe',
        project_id: this.projectId
      })
    }
  }

  private handleMessage(event: MessageEvent) {
    try {
      const data: WebSocketMessage = JSON.parse(event.data)
      
      if (data.type === 'error') {
        console.error('WebSocket error:', data.message)
        if (data.message?.toLowerCase().includes('authentication')) {
          this.handleAuthError()
          return
        }
        return
      }

      switch (data.type) {
        case 'agent_status':
          if (data.agent_id && data.status) {
            this.updateAgentStatus(data.agent_id, data.status)
          }
          break

        case 'agent_update':
          if (data.agent_id && data.data) {
            this.updateAgentData(data.agent_id, data.data)
          }
          break

        case 'agent_metrics':
          if (data.agent_id && data.metrics) {
            this.updateAgentMetrics(data.agent_id, data.metrics)
          }
          break

        default:
          console.warn('Unknown message type:', data.type)
      }
    } catch (error) {
      this.handleError({
        code: 1007, // Invalid Data
        reason: 'Failed to process WebSocket message',
        timestamp: Date.now()
      })
    }
  }

  private handleClose(event?: CloseEvent) {
    console.log('WebSocket disconnected', event?.code, event?.reason)
    this.ws = null

    // Handle authentication error
    if (event?.code === 1008) { // Policy Violation (auth error)
      this.handleAuthError()
      return
    }

    // Only attempt to reconnect if we haven't exceeded max attempts
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.min(this.baseDelay * Math.pow(2, this.reconnectAttempts), this.maxDelay)

      this.reconnectTimeout = setTimeout(() => {
        if (this.projectId) {
          console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
          this.connect(this.projectId)
        }
      }, delay)
    } else {
      this.handleError({
        code: 1006, // Abnormal Closure
        reason: 'Max reconnection attempts reached',
        timestamp: Date.now()
      })
    }
  }

  private handleError(error: WebSocketError | Event | Error | unknown) {
    let errorDetails: WebSocketError

    if (error instanceof Event) {
      const wsError = error as ErrorEvent
      errorDetails = {
        code: 1006, // Abnormal Closure
        reason: wsError.message || 'WebSocket connection error',
        timestamp: Date.now()
      }
    } else if (error instanceof Error) {
      errorDetails = {
        code: 1006,
        reason: error.message || 'WebSocket error',
        timestamp: Date.now()
      }
    } else if (typeof error === 'object' && error !== null && 'code' in error) {
      // Handle custom WebSocketError
      errorDetails = error as WebSocketError
    } else {
      // Handle unknown error type
      errorDetails = {
        code: 1006,
        reason: 'Unknown WebSocket error',
        timestamp: Date.now()
      }
    }

    // Log error with more context
    console.error('WebSocket error:', {
      code: errorDetails.code,
      reason: errorDetails.reason,
      timestamp: new Date(errorDetails.timestamp).toISOString(),
      originalError: error instanceof Event ? {
        type: error.type,
        target: error.target ? 'WebSocket' : 'Unknown',
        eventPhase: error.eventPhase
      } : error
    })

    // Call error callback if set
    if (this.onErrorCallback) {
      this.onErrorCallback(errorDetails)
    }

    // Close the connection
    if (this.ws) {
      try {
        this.ws.close()
      } catch (closeError) {
        console.error('Error closing WebSocket:', closeError)
      }
    }
  }

  private handleAuthError() {
    console.error('WebSocket authentication error')
    if (this.onAuthErrorCallback) {
      this.onAuthErrorCallback()
    }
    this.disconnect()
  }

  private updateAgentStatus(agentId: string, status: string) {
    this.queryClient.setQueryData(['agents', this.projectId], (oldData: Agent[] | undefined) => {
      if (!oldData) return oldData
      return oldData.map(agent => 
        agent.id === agentId 
          ? { ...agent, agent_status: status }
          : agent
      )
    })
  }

  private updateAgentData(agentId: string, data: Partial<Agent>) {
    this.queryClient.setQueryData(['agents', this.projectId], (oldData: Agent[] | undefined) => {
      if (!oldData) return oldData
      return oldData.map(agent => 
        agent.id === agentId 
          ? { ...agent, ...data }
          : agent
      )
    })
  }

  private updateAgentMetrics(agentId: string, metrics: Record<string, any>) {
    this.queryClient.setQueryData(['agents', this.projectId], (oldData: Agent[] | undefined) => {
      if (!oldData) return oldData
      return oldData.map(agent => 
        agent.id === agentId 
          ? { 
              ...agent, 
              advanced_settings: {
                ...agent.advanced_settings,
                ...metrics
              }
            }
          : agent
      )
    })
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(data))
      } catch (error) {
        this.handleError({
          code: 1007, // Invalid Data
          reason: 'Failed to send message',
          timestamp: Date.now()
        })
      }
    } else {
      this.handleError({
        code: 1006, // Abnormal Closure
        reason: 'WebSocket is not connected',
        timestamp: Date.now()
      })
    }
  }

  onError(callback: (error: WebSocketError) => void) {
    this.onErrorCallback = callback
  }

  onAuthError(callback: () => void) {
    this.onAuthErrorCallback = callback
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }
    if (this.ws) {
      try {
        this.ws.close()
      } catch (error) {
        console.error('Error closing WebSocket:', error)
      }
    }
    this.ws = null
    this.projectId = null
    this.reconnectAttempts = 0
    this.onErrorCallback = null
    this.onAuthErrorCallback = null
  }
}

// Create a singleton instance
let wsService: WebSocketService | null = null

export const getWebSocketService = (queryClient: QueryClient, token: string) => {
  if (!wsService) {
    wsService = new WebSocketService(queryClient, token)
  }
  return wsService
}

export const disconnectWebSocket = () => {
  if (wsService) {
    wsService.disconnect()
    wsService = null
  }
} 