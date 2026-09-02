import { configureStore } from "@reduxjs/toolkit";
import agentReducer from "./features/agentSlice";
import agentsReducer from "./slices/agentsSlice";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    agent: agentReducer,
    agents: agentsReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
