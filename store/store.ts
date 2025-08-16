import { configureStore } from "@reduxjs/toolkit";
import competitorAnalysisReducer from "./slices/competitorAnalysisSlice";
import agentReducer from "./features/agentSlice";
import projectsReducer from "./slices/projectsSlice";
import currentProjectReducer from "./slices/currentProjectSlice";
import agentsReducer from "./slices/agentsSlice";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    agent: agentReducer,
    projects: projectsReducer,
    currentProject: currentProjectReducer,
    agents: agentsReducer,
    user: userReducer,
    competitorAnalysis: competitorAnalysisReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
