"use client";

import { createClient } from "@supabase/supabase-js";
import { useState, useEffect, ReactNode } from "react";
import { SupabaseContext } from "./SupabaseContext";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function SupabaseProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [supabase] = useState(() =>
    createClient(supabaseUrl, supabaseAnonKey)
  );

  // Refresh session on mount
  useEffect(() => {
    supabase.auth.getSession();
  }, [supabase]);

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
}
