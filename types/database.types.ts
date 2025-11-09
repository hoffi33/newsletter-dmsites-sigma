export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company: string | null
          plan_tier: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          usage_count: number
          usage_limit: number
          usage_reset_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company?: string | null
          plan_tier?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          usage_count?: number
          usage_limit?: number
          usage_reset_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company?: string | null
          plan_tier?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          usage_count?: number
          usage_limit?: number
          usage_reset_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      content_sources: {
        Row: {
          id: string
          user_id: string
          type: string
          url: string | null
          title: string | null
          transcript: string | null
          metadata: Json | null
          word_count: number | null
          duration_minutes: number | null
          processed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          url?: string | null
          title?: string | null
          transcript?: string | null
          metadata?: Json | null
          word_count?: number | null
          duration_minutes?: number | null
          processed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          url?: string | null
          title?: string | null
          transcript?: string | null
          metadata?: Json | null
          word_count?: number | null
          duration_minutes?: number | null
          processed_at?: string | null
          created_at?: string
        }
      }
      newsletters: {
        Row: {
          id: string
          user_id: string
          content_source_id: string | null
          analysis_id: string | null
          title: string | null
          subject_lines: Json | null
          selected_subject_line: string | null
          content_markdown: string | null
          content_html: string | null
          tone: string | null
          length: string | null
          structure: string | null
          word_count: number | null
          reading_time_minutes: number | null
          status: string
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content_source_id?: string | null
          analysis_id?: string | null
          title?: string | null
          subject_lines?: Json | null
          selected_subject_line?: string | null
          content_markdown?: string | null
          content_html?: string | null
          tone?: string | null
          length?: string | null
          structure?: string | null
          word_count?: number | null
          reading_time_minutes?: number | null
          status?: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content_source_id?: string | null
          analysis_id?: string | null
          title?: string | null
          subject_lines?: Json | null
          selected_subject_line?: string | null
          content_markdown?: string | null
          content_html?: string | null
          tone?: string | null
          length?: string | null
          structure?: string | null
          word_count?: number | null
          reading_time_minutes?: number | null
          status?: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
