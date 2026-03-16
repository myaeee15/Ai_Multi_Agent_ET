import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          user_id: string;
          content: string;
          files: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          user_id: string;
          content: string;
          files?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          user_id?: string;
          content?: string;
          files?: any;
          created_at?: string;
        };
      };
      agent_responses: {
        Row: {
          id: string;
          message_id: string;
          agent_type: string;
          response: string;
          tokens_used: number;
          response_time_ms: number;
          rating: number;
          is_best: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          agent_type: string;
          response: string;
          tokens_used?: number;
          response_time_ms?: number;
          rating?: number;
          is_best?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          message_id?: string;
          agent_type?: string;
          response?: string;
          tokens_used?: number;
          response_time_ms?: number;
          rating?: number;
          is_best?: boolean;
          created_at?: string;
        };
      };
      saved_prompts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          created_at?: string;
        };
      };
      export_history: {
        Row: {
          id: string;
          user_id: string;
          message_id: string;
          export_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          message_id: string;
          export_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          message_id?: string;
          export_type?: string;
          created_at?: string;
        };
      };
    };
  };
};
