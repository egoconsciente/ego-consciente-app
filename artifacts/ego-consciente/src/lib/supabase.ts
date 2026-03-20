import { createClient } from "@supabase/supabase-js";

const rawUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string;

if (!rawUrl || !supabaseKey) {
  throw new Error(
    "Variables de Supabase no configuradas. Revisa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
  );
}

const supabaseUrl = rawUrl.replace(/\/$/, "");

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; created_at: string };
        Insert: { id: string };
        Update: { id?: string };
      };
      pea_entries: {
        Row: {
          id: string;
          user_id: string;
          day_number: number;
          thought: string;
          emotion: string;
          action: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          day_number: number;
          thought: string;
          emotion: string;
          action: string;
        };
        Update: {
          thought?: string;
          emotion?: string;
          action?: string;
        };
      };
      daily_progress: {
        Row: {
          id: string;
          user_id: string;
          day_number: number;
          step_text: string;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          day_number: number;
          step_text: string;
          completed?: boolean;
        };
      };
    };
  };
};
