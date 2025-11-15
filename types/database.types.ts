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
      content_analyses: {
        Row: {
          id: string
          content_source_id: string
          main_topic: string | null
          sub_topics: string[] | null
          key_takeaways: string[] | null
          quotes: string[] | null
          examples: Json | null
          target_audience: string | null
          audience_level: string | null
          pain_points: string[] | null
          suggested_ctas: string[] | null
          sentiment: string | null
          difficulty: string | null
          full_analysis: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          content_source_id: string
          main_topic?: string | null
          sub_topics?: string[] | null
          key_takeaways?: string[] | null
          quotes?: string[] | null
          examples?: Json | null
          target_audience?: string | null
          audience_level?: string | null
          pain_points?: string[] | null
          suggested_ctas?: string[] | null
          sentiment?: string | null
          difficulty?: string | null
          full_analysis?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          content_source_id?: string
          main_topic?: string | null
          sub_topics?: string[] | null
          key_takeaways?: string[] | null
          quotes?: string[] | null
          examples?: Json | null
          target_audience?: string | null
          audience_level?: string | null
          pain_points?: string[] | null
          suggested_ctas?: string[] | null
          sentiment?: string | null
          difficulty?: string | null
          full_analysis?: Json | null
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
      content_ideas: {
        Row: {
          id: string
          user_id: string
          topic: string | null
          suggested_headline: string | null
          angle: string | null
          outline: string | null
          category: string | null
          difficulty: string | null
          urgency: string | null
          priority_score: number | null
          rationale: Json | null
          status: string
          scheduled_date: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          topic?: string | null
          suggested_headline?: string | null
          angle?: string | null
          outline?: string | null
          category?: string | null
          difficulty?: string | null
          urgency?: string | null
          priority_score?: number | null
          rationale?: Json | null
          status?: string
          scheduled_date?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          topic?: string | null
          suggested_headline?: string | null
          angle?: string | null
          outline?: string | null
          category?: string | null
          difficulty?: string | null
          urgency?: string | null
          priority_score?: number | null
          rationale?: Json | null
          status?: string
          scheduled_date?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      audience_segments: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          criteria: Json | null
          size_estimate: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          criteria?: Json | null
          size_estimate?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          criteria?: Json | null
          size_estimate?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      newsletter_analytics: {
        Row: {
          id: string
          newsletter_id: string | null
          user_id: string
          sent_count: number | null
          delivered_count: number | null
          open_count: number | null
          click_count: number | null
          unsubscribe_count: number | null
          bounce_count: number | null
          open_rate: number | null
          click_rate: number | null
          unsubscribe_rate: number | null
          bounce_rate: number | null
          sent_at: string | null
          esp_name: string | null
          metadata: Json | null
          recorded_at: string
        }
        Insert: {
          id?: string
          newsletter_id?: string | null
          user_id: string
          sent_count?: number | null
          delivered_count?: number | null
          open_count?: number | null
          click_count?: number | null
          unsubscribe_count?: number | null
          bounce_count?: number | null
          open_rate?: number | null
          click_rate?: number | null
          unsubscribe_rate?: number | null
          bounce_rate?: number | null
          sent_at?: string | null
          esp_name?: string | null
          metadata?: Json | null
          recorded_at?: string
        }
        Update: {
          id?: string
          newsletter_id?: string | null
          user_id?: string
          sent_count?: number | null
          delivered_count?: number | null
          open_count?: number | null
          click_count?: number | null
          unsubscribe_count?: number | null
          bounce_count?: number | null
          open_rate?: number | null
          click_rate?: number | null
          unsubscribe_rate?: number | null
          bounce_rate?: number | null
          sent_at?: string | null
          esp_name?: string | null
          metadata?: Json | null
          recorded_at?: string
        }
      }
      competitors: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string
          website: string | null
          industry: string | null
          monitoring_active: boolean
          last_scraped_at: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email: string
          website?: string | null
          industry?: string | null
          monitoring_active?: boolean
          last_scraped_at?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string
          website?: string | null
          industry?: string | null
          monitoring_active?: boolean
          last_scraped_at?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
    }
  }
}
