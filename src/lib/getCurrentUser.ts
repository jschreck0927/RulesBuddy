import { supabaseServer } from "./supabaseServer";

export async function getCurrentUser() {
  const supabase = supabaseServer();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }

  return user;
}
