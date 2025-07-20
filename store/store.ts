import { configureStore } from '@reduxjs/toolkit';
import agentReducer from './features/agentSlice';
import projectsReducer from './slices/projectsSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    agent: agentReducer,
    projects: projectsReducer,
    user: userReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 