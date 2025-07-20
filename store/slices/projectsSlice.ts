import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { LucideIcon } from 'lucide-react';
import { refreshAccessToken } from "@/lib/utils";

interface Project {
  uuid: string;
  id: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  dueDate: string;
  startDate: string;
  lastUpdated: string;
  priority: string;
  category: string;
  budget: number;
  budgetSpent: number;
  team: Array<{
    name: string;
    avatar: string;
    initials: string;
    role: string;
  }>;
  tags: string[];
  metrics: {
    tasks: number;
    completed: number;
    comments: number;
    attachments: number;
  };
  health: string;
  starred: boolean;
  icon: LucideIcon;
}

interface ProjectsState {
  items: Project[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProjectsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async () => {
    let token = Cookies.get('access_token');
    let response = await fetch('http://localhost:8000/projects', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    debugger
    
    // If unauthorized, try to refresh the token and retry once
    if (response.status === 401) {
      token = await refreshAccessToken();
      if (token) {
        response = await fetch('http://localhost:8000/projects', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch projects');
    }
    
    return response.json();
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch projects';
      });
  },
});

export default projectsSlice.reducer;
