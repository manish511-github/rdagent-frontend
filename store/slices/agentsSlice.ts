import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { refreshAccessToken } from "@/lib/utils";
import { getApiUrl } from "../../lib/config";
import {
  Agent,
  ApiAgent,
  CreateAgentPayload,
  PlatformSettings,
} from "@/types/agentDataTypes";

interface AgentsState {
  agents: Agent[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  lastFetchedProjectId: string | null; // Track which project's agents were last fetched
  createStatus: "idle" | "loading" | "succeeded" | "failed";
  updateStatus: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: AgentsState = {
  agents: [],
  status: "idle",
  error: null,
  lastFetchedProjectId: null,
  createStatus: "idle",
  updateStatus: "idle",
};

// Async thunk to fetch agents for a project
export const fetchAgents = createAsyncThunk(
  "agents/fetchAgents",
  async (projectId: string, { rejectWithValue }) => {
    try {
      let token = Cookies.get("access_token");
      let response = await fetch(getApiUrl(`projects/${projectId}/agents`), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // If unauthorized, try to refresh the token and retry once
      if (response.status === 401) {
        token = await refreshAccessToken();
        if (token) {
          response = await fetch(getApiUrl(`projects/${projectId}/agents`), {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        }
      }

      if (!response.ok) {
        if (response.status === 401) {
          return rejectWithValue("Authentication failed");
        }
        if (response.status === 404) {
          return rejectWithValue("Project not found");
        }
        const error = await response.json().catch(() => ({}));
        return rejectWithValue(error.message || "Failed to fetch agents");
      }

      return response.json();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Network error"
      );
    }
  }
);

// Async thunk to create a new agent
export const createAgent = createAsyncThunk(
  "agents/createAgent",
  async (agentData: CreateAgentPayload, { rejectWithValue, dispatch }) => {
    try {
      let token = Cookies.get("access_token");
      let response = await fetch(getApiUrl("agents"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(agentData),
      });

      // If unauthorized, try to refresh the token and retry once
      if (response.status === 401) {
        token = await refreshAccessToken();
        if (token) {
          response = await fetch(getApiUrl("agents"), {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(agentData),
          });
        }
      }

      if (!response.ok) {
        if (response.status === 401) {
          return rejectWithValue("Authentication failed");
        }
        if (response.status === 404) {
          return rejectWithValue(
            "Project not found or you don't have access to it"
          );
        }
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData.detail || "Failed to create agent");
      }

      const newAgent = await response.json();

      // Refresh the agents list for the project
      dispatch(fetchAgents(agentData.project_id));

      return newAgent;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Network error"
      );
    }
  }
);

// Async thunk to update agent status
export const updateAgentStatus = createAsyncThunk(
  "agents/updateAgentStatus",
  async (
    {
      projectId,
      agentId,
      status,
    }: { projectId: string; agentId: string; status: string },
    { rejectWithValue }
  ) => {
    try {
      let token = Cookies.get("access_token");
      let response = await fetch(
        getApiUrl(`agents/${projectId}/${agentId}/status`),
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      // If unauthorized, try to refresh the token and retry once
      if (response.status === 401) {
        token = await refreshAccessToken();
        if (token) {
          response = await fetch(
            getApiUrl(`agents/${projectId}/${agentId}/status`),
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ status }),
            }
          );
        }
      }

      if (!response.ok) {
        if (response.status === 401) {
          return rejectWithValue("Authentication failed");
        }
        const error = await response.json().catch(() => ({}));
        return rejectWithValue(
          error.message || "Failed to update agent status"
        );
      }

      return response.json();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Network error"
      );
    }
  }
);

const agentsSlice = createSlice({
  name: "agents",
  initialState,
  reducers: {
    // Clear agents data (useful when navigating away from project)
    clearAgents: (state) => {
      state.agents = [];
      state.status = "idle";
      state.error = null;
      state.lastFetchedProjectId = null;
    },
    // Clear error state
    clearError: (state) => {
      state.error = null;
    },
    // Clear create status
    clearCreateStatus: (state) => {
      state.createStatus = "idle";
    },
    // Clear update status
    clearUpdateStatus: (state) => {
      state.updateStatus = "idle";
    },
    // Update agent status locally (optimistic update)
    updateAgentStatusLocally: (state, action) => {
      const { agentId, status } = action.payload;
      const agent = state.agents.find((a) => a.id === agentId);
      if (agent) {
        agent.agent_status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchAgents
      .addCase(fetchAgents.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.lastFetchedProjectId = action.meta.arg;
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.agents = action.payload;
        state.error = null;
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to fetch agents";
      })
      // Handle createAgent
      .addCase(createAgent.pending, (state) => {
        state.createStatus = "loading";
        state.error = null;
      })
      .addCase(createAgent.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        // Agent will be added to the list when fetchAgents is called automatically
        state.error = null;
      })
      .addCase(createAgent.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = (action.payload as string) || "Failed to create agent";
      })
      // Handle updateAgentStatus
      .addCase(updateAgentStatus.pending, (state) => {
        state.updateStatus = "loading";
        state.error = null;
      })
      .addCase(updateAgentStatus.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        // Update the agent in the list
        const updatedAgent = action.payload;
        const index = state.agents.findIndex((a) => a.id === updatedAgent.id);
        if (index !== -1) {
          state.agents[index] = updatedAgent;
        }
        state.error = null;
      })
      .addCase(updateAgentStatus.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.error =
          (action.payload as string) || "Failed to update agent status";
      });
  },
});

export const {
  clearAgents,
  clearError,
  clearCreateStatus,
  clearUpdateStatus,
  updateAgentStatusLocally,
} = agentsSlice.actions;

// Selectors
export const selectAgents = (state: { agents: AgentsState }) =>
  state.agents.agents;
export const selectAgentsStatus = (state: { agents: AgentsState }) =>
  state.agents.status;
export const selectAgentsError = (state: { agents: AgentsState }) =>
  state.agents.error;
export const selectAgentsLoading = (state: { agents: AgentsState }) =>
  state.agents.status === "loading";
export const selectCreateAgentStatus = (state: { agents: AgentsState }) =>
  state.agents.createStatus;
export const selectUpdateAgentStatus = (state: { agents: AgentsState }) =>
  state.agents.updateStatus;
export const selectLastFetchedProjectId = (state: { agents: AgentsState }) =>
  state.agents.lastFetchedProjectId;

// Selector to get a specific agent by ID
export const selectAgentById =
  (agentId: string | number) => (state: { agents: AgentsState }) => {
    const numericId =
      typeof agentId === "string" ? parseInt(agentId, 10) : agentId;
    return state.agents.agents.find((agent) => agent.id === numericId);
  };

export default agentsSlice.reducer;
