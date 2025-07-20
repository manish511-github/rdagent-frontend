"use client"

import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { useEffect } from "react";
import { fetchUser } from "@/store/slices/userSlice";
export function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(fetchUser());
  }, []);
  return <Provider store={store}>{children}</Provider>;
}
