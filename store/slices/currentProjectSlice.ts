import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { refreshAccessToken } from "@/lib/utils";
import { getApiUrl } from "../../lib/config";

// Complete project interface based on API response
export interface CurrentProject {
  uuid: string;
  title: string;
  description: string;
  target_audience: string;
  website_url: string;
  category: string;
  priority: string;
  due_date: string;
  budget: number;
  team: any[];
  tags: string[];
  competitors: string[];
  keywords: string[];
  excluded_keywords: string[];
  status: string;
  progress: number;
  health: string;
  created_at: string;
  updated_at: string;
}

interface CurrentProjectState {
  project: CurrentProject | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  lastFetchedId: string | null; // Track which project was last fetched
}

const initialState: CurrentProjectState = {
  project: null,
  status: "idle",
  error: null,
  lastFetchedId: null,
};

// Async thunk to fetch project details by ID
export const fetchCurrentProject = createAsyncThunk(
  "currentProject/fetchCurrentProject",
  async (projectId: string, { rejectWithValue }) => {
    try {
      let token = Cookies.get("access_token");
      let response = await fetch(getApiUrl(`projects/${projectId}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // If unauthorized, try to refresh the token and retry once
      if (response.status === 401) {
        token = await refreshAccessToken();
        if (token) {
          response = await fetch(getApiUrl(`projects/${projectId}`), {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
      }

      if (!response.ok) {
        if (response.status === 404) {
          return rejectWithValue("Project not found");
        }
        if (response.status === 401) {
          return rejectWithValue("Authentication failed");
        }
        const error = await response.json().catch(() => ({}));
        return rejectWithValue(
          error.message || "Failed to fetch project details"
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

// Async thunk to update project details
export const updateCurrentProject = createAsyncThunk(
  "currentProject/updateCurrentProject",
  async (
    {
      projectId,
      updates,
    }: { projectId: string; updates: Partial<CurrentProject> },
    { rejectWithValue }
  ) => {
    try {
      let token = Cookies.get("access_token");
      let response = await fetch(getApiUrl(`projects/${projectId}`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      // If unauthorized, try to refresh the token and retry once
      if (response.status === 401) {
        token = await refreshAccessToken();
        if (token) {
          response = await fetch(getApiUrl(`projects/${projectId}`), {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updates),
          });
        }
      }

      if (!response.ok) {
        if (response.status === 404) {
          return rejectWithValue("Project not found");
        }
        if (response.status === 401) {
          return rejectWithValue("Authentication failed");
        }
        const error = await response.json().catch(() => ({}));
        return rejectWithValue(error.message || "Failed to update project");
      }

      return response.json();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Network error"
      );
    }
  }
);

const currentProjectSlice = createSlice({
  name: "currentProject",
  initialState,
  reducers: {
    // Clear current project data (useful when navigating away)
    clearCurrentProject: (state) => {
      state.project = null;
      state.status = "idle";
      state.error = null;
      state.lastFetchedId = null;
    },
    // Clear error state
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchCurrentProject
      .addCase(fetchCurrentProject.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.lastFetchedId = action.meta.arg;
      })
      .addCase(fetchCurrentProject.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.project = action.payload;
        state.error = null;
      })
      .addCase(fetchCurrentProject.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to fetch project";
        // Don't clear the project data on error, keep the last successful data
      })
      // Handle updateCurrentProject
      .addCase(updateCurrentProject.pending, (state) => {
        // Don't change status to loading for updates to avoid UI flicker
        state.error = null;
      })
      .addCase(updateCurrentProject.fulfilled, (state, action) => {
        state.project = action.payload;
        state.error = null;
      })
      .addCase(updateCurrentProject.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to update project";
      });
  },
});

export const { clearCurrentProject, clearError } = currentProjectSlice.actions;

// Selectors
export const selectCurrentProject = (state: {
  currentProject: CurrentProjectState;
}) => state.currentProject.project;
export const selectCurrentProjectStatus = (state: {
  currentProject: CurrentProjectState;
}) => state.currentProject.status;
export const selectCurrentProjectError = (state: {
  currentProject: CurrentProjectState;
}) => state.currentProject.error;
export const selectCurrentProjectLoading = (state: {
  currentProject: CurrentProjectState;
}) => state.currentProject.status === "loading";

export default currentProjectSlice.reducer;
