import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { refreshAccessToken } from "@/lib/utils";
import { getApiUrl } from "../../lib/config";
import {
  ApiProject,
  Project,
  ProjectSummary,
} from "../../components/kokonutui/project-page/projectTypes";

interface ProjectsState {
  items: Project[];
  summary: ProjectSummary | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  summaryStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  summaryError: string | null;
}

const initialState: ProjectsState = {
  items: [],
  summary: null,
  status: "idle",
  summaryStatus: "idle",
  error: null,
  summaryError: null,
};

// Helper function to transform API project to UI project
const transformApiProject = (apiProject: ApiProject): Project => {
  // Generate some default values for UI fields that don't exist in API
  const defaultTeam = apiProject.team || [];

  // Handle tags - filter out single characters and invalid entries
  const defaultTags = apiProject.tags
    ? apiProject.tags.filter(
        (tag) => tag.length > 1 && tag !== "," && tag !== "{" && tag !== "}"
      )
    : [];

  // Determine status based on agent_count and activity
  let status = "Planning";
  if (apiProject.agent_count > 0) {
    status = apiProject.last_activity ? "Active" : "Paused";
  }

  // Calculate progress based on agent count (simplified logic)
  const progress = Math.min(apiProject.agent_count * 25, 100);

  // Determine health based on activity
  let health = "healthy";
  if (apiProject.last_activity) {
    const lastActivityDate = new Date(apiProject.last_activity);
    const daysSinceActivity =
      (Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceActivity > 7) health = "at-risk";
    else if (daysSinceActivity > 3) health = "warning";
  }

  // Convert team strings to team objects for UI compatibility
  const teamObjects = defaultTeam.map((member, index) => ({
    name: member,
    avatar: `/placeholder-user.jpg`,
    initials: member
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase(),
    role: "Team Member",
  }));

  // Convert budget string to number (extract first number from range like "$10000-$20000")
  let budgetNumber = 0;
  if (apiProject.budget) {
    const budgetMatch = apiProject.budget.match(/\$?(\d+)/);
    if (budgetMatch) {
      budgetNumber = parseInt(budgetMatch[1], 10);
    }
  }

  return {
    uuid: apiProject.uuid,
    title: apiProject.title,
    description: apiProject.description,
    status,
    progress,
    dueDate: apiProject.due_date || "",
    startDate: apiProject.created_at,
    lastUpdated: apiProject.last_activity || apiProject.created_at,
    priority: apiProject.priority,
    category: apiProject.category,
    budget: budgetNumber,
    budgetSpent: 0, // Not provided by API
    team: teamObjects,
    tags: defaultTags,
    metrics: {
      tasks: 0, // Not provided by API
      completed: 0, // Not provided by API
      comments: 0, // Not provided by API
      attachments: 0, // Not provided by API
    },
    health,
    starred: false, // Not provided by API
    // New fields from API
    targetAudience: apiProject.target_audience,
    websiteUrl: apiProject.website_url,
    competitors: apiProject.competitors,
    keywords: apiProject.keywords,
    excludedKeywords: apiProject.excluded_keywords,
    agentCount: apiProject.agent_count,
    lastActivity: apiProject.last_activity,
  };
};

export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async () => {
    let token = Cookies.get("access_token");
    let response = await fetch(getApiUrl("projects"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // If unauthorized, try to refresh the token and retry once
    if (response.status === 401) {
      token = await refreshAccessToken();
      if (token) {
        response = await fetch(getApiUrl("projects"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch projects");
    }

    const apiProjects: ApiProject[] = await response.json();
    return apiProjects.map(transformApiProject);
  }
);

export const fetchProjectSummary = createAsyncThunk(
  "projects/fetchProjectSummary",
  async () => {
    let token = Cookies.get("access_token");
    let response = await fetch(getApiUrl("projects/summary"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // If unauthorized, try to refresh the token and retry once
    if (response.status === 401) {
      token = await refreshAccessToken();
      if (token) {
        response = await fetch(getApiUrl("projects/summary"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch project summary");
    }

    return response.json();
  }
);

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Projects
      .addCase(fetchProjects.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch projects";
      })
      // Project Summary
      .addCase(fetchProjectSummary.pending, (state) => {
        state.summaryStatus = "loading";
        state.summaryError = null;
      })
      .addCase(fetchProjectSummary.fulfilled, (state, action) => {
        state.summaryStatus = "succeeded";
        state.summary = action.payload;
        state.summaryError = null;
      })
      .addCase(fetchProjectSummary.rejected, (state, action) => {
        state.summaryStatus = "failed";
        state.summaryError =
          action.error.message || "Failed to fetch project summary";
      });
  },
});

export default projectsSlice.reducer;
