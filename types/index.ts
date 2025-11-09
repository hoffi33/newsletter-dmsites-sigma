export * from './database.types'

// Additional types
export interface ContentSource {
  id: string
  user_id: string
  type: 'youtube' | 'podcast' | 'blog' | 'text'
  url?: string
  title?: string
  transcript?: string
  metadata?: any
  word_count?: number
  duration_minutes?: number
  processed_at?: string
  created_at: string
}

export interface Newsletter {
  id: string
  user_id: string
  content_source_id?: string
  analysis_id?: string
  title?: string
  subject_lines?: string[]
  selected_subject_line?: string
  content_markdown?: string
  content_html?: string
  tone?: string
  length?: string
  structure?: string
  word_count?: number
  reading_time_minutes?: number
  status: 'draft' | 'ready' | 'sent'
  metadata?: any
  created_at: string
  updated_at: string
}

export interface ContentAnalysis {
  id: string
  content_source_id: string
  main_topic: string
  sub_topics: string[]
  key_takeaways: string[]
  quotes: string[]
  examples: any
  target_audience: string
  audience_level: string
  pain_points: string[]
  suggested_ctas: string[]
  sentiment: string
  difficulty: string
  full_analysis: any
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  company?: string
  plan_tier: 'free' | 'basic' | 'pro' | 'agency'
  stripe_customer_id?: string
  stripe_subscription_id?: string
  subscription_status?: string
  usage_count: number
  usage_limit: number
  usage_reset_date?: string
  created_at: string
  updated_at: string
}
