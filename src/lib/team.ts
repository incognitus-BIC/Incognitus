import { supabase, isSupabaseConfigured } from "./supabase";
import type { TeamMember } from "@/types/database";

export const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  { id: "1", name: "Member Name", role: "President", initials: "MN", image_url: null, display_order: 1, is_active: true, created_at: "" },
  { id: "2", name: "Member Name", role: "Vice President", initials: "MN", image_url: null, display_order: 2, is_active: true, created_at: "" },
  { id: "3", name: "Member Name", role: "Technical Lead", initials: "MN", image_url: null, display_order: 3, is_active: true, created_at: "" },
  { id: "4", name: "Member Name", role: "Events Coordinator", initials: "MN", image_url: null, display_order: 4, is_active: true, created_at: "" },
  { id: "5", name: "Member Name", role: "CTF Captain", initials: "MN", image_url: null, display_order: 5, is_active: true, created_at: "" },
  { id: "6", name: "Member Name", role: "Community Manager", initials: "MN", image_url: null, display_order: 6, is_active: true, created_at: "" },
];

export async function getTeamMembers(): Promise<TeamMember[]> {
  if (!isSupabaseConfigured || !supabase) {
    return DEFAULT_TEAM_MEMBERS;
  }

  try {
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_TEAM_MEMBERS;
    }

    return data;
  } catch {
    return DEFAULT_TEAM_MEMBERS;
  }
}
