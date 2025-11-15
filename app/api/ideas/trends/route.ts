import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchGoogleTrends } from '@/lib/trends/google-trends'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check cache first
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: cachedTrends } = await supabase
      .from('trending_topics')
      .select('*')
      .gt('created_at', oneDayAgo)
      .order('growth_rate', { ascending: false })
      .limit(20)

    if (cachedTrends && cachedTrends.length > 0) {
      return NextResponse.json({ trends: cachedTrends, cached: true })
    }

    // Fetch fresh trends
    const keywords = ['AI', 'Machine Learning', 'Technology', 'Startups', 'Marketing']
    const trends = await fetchGoogleTrends(keywords)

    // Save to database
    const trendsToSave = trends.map((trend) => ({
      topic: trend.topic,
      source: 'google_trends',
      trend_data: {
        search_volume: trend.search_volume,
        growth_rate: trend.growth_rate,
      },
      search_volume: trend.search_volume,
      growth_rate: trend.growth_rate,
      category: trend.category,
      relevance_score: trend.relevance_score,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }))

    // Clear old trends
    await supabase.from('trending_topics').delete().lt('expires_at', new Date().toISOString())

    // Insert new trends
    const { data: savedTrends } = await supabase.from('trending_topics').insert(trendsToSave).select()

    return NextResponse.json({ trends: savedTrends, cached: false })
  } catch (error: any) {
    console.error('Trends fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
