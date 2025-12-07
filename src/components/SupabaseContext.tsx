"use client";

import { createContext, useContext } from "react";
import { SupabaseClient } from "@supabase/supabase-js";

// Named export — NOT default
export const SupabaseContext = createContext<SupabaseClient | null>(null);

// Helper hook
export function useSupabase() {
  return useContext(SupabaseContext);
}
