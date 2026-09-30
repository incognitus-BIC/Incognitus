import { supabase, isSupabaseConfigured } from "./supabase";
import type { Event } from "@/types/database";

export async function getPublishedEvents(): Promise<Event[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("is_published", true)
      .order("date", { ascending: true });

    if (error) {
      console.warn("Failed to fetch events from Supabase:", error.message);
      return [];
    }

    return data ?? [];
  } catch (err) {
    console.warn("Unexpected error fetching events:", err);
    return [];
  }
}
