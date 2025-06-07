import { configureStore } from '@reduxjs/toolkit';
import agentReducer from './features/agentSlice';
import projectsReducer from './slices/projectsSlice';

export const store = configureStore({
  reducer: {
    agent: agentReducer,
    projects: projectsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 