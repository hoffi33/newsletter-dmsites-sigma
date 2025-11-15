import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCompletion } from '@/lib/ai/claude'

async function analyzeCompetitorNewsletter(newsletter: any) {
  const systemPrompt = `You are an expert at analyzing competitor newsletters and extracting strategic insights.`

  const prompt = `Analyze this competitor newsletter and provide strategic insights:

SUBJECT LINE: ${newsletter.subject_line}

CONTENT:
${newsletter.content_text?.substring(0, 3000) || newsletter.content_html?.substring(0, 3000)}

Analyze and extract:
1. MAIN TOPICS: What are they writing about?
2. ANGLE/PERSPECTIVE: What's their unique take?
3. STRUCTURE: How is the content organized?
4. TONE & VOICE: Professional, casual, technical?
5. CTAs: What actions do they want readers to take?
6. MARKETING TACTICS: Urgency, social proof, scarcity, etc?
7. STRENGTHS: What they do really well
8. WEAKNESSES: Where we can outperform them
9. OUR RESPONSE STRATEGY: How should we respond?

Return JSON:
{
  "main_topics": ["topic 1", "topic 2"],
  "angle": "their unique perspective",
  "structure": "how content is organized",
  "tone": "professional | casual | technical | friendly",
  "ctas": ["CTA 1", "CTA 2"],
  "marketing_tactics": ["tactic 1", "tactic 2"],
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "response_strategy": "how we should respond to this",
  "overall_quality_score": number (1-10)
}

Return ONLY valid JSON.`

  const response = await generateCompletion(prompt, systemPrompt, 3000)

  try {
    return JSON.parse(response)
  } catch (e) {
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```\n([\s\S]*?)\n```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1])
    }
    throw new Error('Failed to parse competitor analysis')
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { competitorId } = await request.json()

    // Fetch competitor newsletters
    const { data: newsletters } = await supabase
      .from('competitor_newsletters')
      .select('*')
      .eq('competitor_id', competitorId)
      .order('scraped_at', { ascending: false })
      .limit(10)

    if (!newsletters || newsletters.length === 0) {
      return NextResponse.json({ error: 'No newsletters found for this competitor' }, { status: 404 })
    }

    // Analyze each newsletter
    const analyses = []
    for (const newsletter of newsletters) {
      const analysis = await analyzeCompetitorNewsletter(newsletter)

      // Update newsletter with analysis
      await supabase
        .from('competitor_newsletters')
        .update({ analysis })
        .eq('id', newsletter.id)

      analyses.push({
        newsletter_id: newsletter.id,
        subject_line: newsletter.subject_line,
        sent_date: newsletter.send_date,
        analysis,
      })
    }

    // Generate aggregate insights
    const allTopics = analyses.flatMap((a) => a.analysis.main_topics)
    const topicFrequency: Record<string, number> = {}
    allTopics.forEach((topic) => {
      topicFrequency[topic] = (topicFrequency[topic] || 0) + 1
    })

    const commonTopics = Object.entries(topicFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic)

    const avgQuality =
      analyses.reduce((sum, a) => sum + (a.analysis.overall_quality_score || 0), 0) / analyses.length

    return NextResponse.json({
      analyses,
      aggregate: {
        total_newsletters_analyzed: analyses.length,
        common_topics: commonTopics,
        average_quality_score: avgQuality.toFixed(1),
        frequency: `${newsletters.length} newsletters in last 30 days`,
      },
    })
  } catch (error: any) {
    console.error('Competitor analysis error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
