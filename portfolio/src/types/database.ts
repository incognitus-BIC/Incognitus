export interface Database {
  public: {
    Tables: {
      events: {
        Row: EventRow;
        Insert: Omit<EventRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<EventRow, "id" | "created_at">>;
      };
      team_members: {
        Row: TeamMemberRow;
        Insert: Omit<TeamMemberRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<TeamMemberRow, "id" | "created_at">>;
      };
    };
  };
}

export interface EventRow {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image_url: string | null;
  registration_form_url: string | null;
  is_published: boolean;
  created_at: string;
}

export type Event = EventRow;

export interface TeamMemberRow {
  id: string;
  name: string;
  role: string;
  initials: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export type TeamMember = TeamMemberRow;
