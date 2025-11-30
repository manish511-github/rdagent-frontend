"use client"

import { Provider } from 'react-redux';
import { useEffect } from "react";
import { store } from '@/store/store';
import { fetchUser } from "@/store/slices/userSlice";
export function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(fetchUser());
  }, []);
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
} 