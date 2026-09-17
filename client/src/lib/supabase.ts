import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

export type SupabaseProfile = { id: string; role: "admin" | "user" };

export async function getProfile(userId: string) {
  if (!supabase) return null;
  const { data } = await supabase.from("profiles").select("id, role").eq("id", userId).maybeSingle();
  return data as SupabaseProfile | null;
}

