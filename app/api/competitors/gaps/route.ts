import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCompletion } from '@/lib/ai/claude'

async function findContentGaps(userTopics: string[], competitorTopics: any[], trendingTopics: string[]) {
  const systemPrompt = `You are an expert content strategist who identifies content gaps and opportunities.`

  const prompt = `Analyze these topics and find content gaps/opportunities:

USER'S PAST TOPICS:
${JSON.stringify(userTopics, null, 2)}

COMPETITOR TOPICS:
${JSON.stringify(competitorTopics, null, 2)}

TRENDING TOPICS:
${JSON.stringify(trendingTopics, null, 2)}

Identify 5-10 content gaps that are:
1. UNCOVERED HIGH-VALUE: Topics competitors write about (or trending) that user hasn't covered
2. TRENDING OPPORTUNITIES: Currently trending topics user hasn't written about yet
3. COMPETITOR RESPONSE: Recent competitor topics where user can create better version

For each gap:
- topic: The topic/theme
- gap_type: "uncovered_high_value" | "trending_opportunity" | "competitor_response"
- description: Why this is valuable (1-2 sentences)
- suggested_angle: How to approach it uniquely
- urgency: "high" | "medium" | "low"
- priority_score: 0.0-1.0
- rationale: Data supporting why this is a gap

Return JSON array of gaps:
[
  {
    "topic": "AI Agent Frameworks",
    "gap_type": "uncovered_high_value",
    "description": "3 competitors wrote about this, high search volume, you haven't covered it",
    "suggested_angle": "Practical comparison of LangChain vs AutoGPT vs CrewAI",
    "urgency": "high",
    "priority_score": 0.9,
    "rationale": {
      "competitor_coverage": 3,
      "trending": true,
      "user_coverage": 0
    }
  }
]

Return ONLY valid JSON array.`

  const response = await generateCompletion(prompt, systemPrompt, 4000)

  try {
    return JSON.parse(response)
  } catch (e) {
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```\n([\s\S]*?)\n```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1])
    }
    throw new Error('Failed to parse content gaps')
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

    // Get user's past topics
    const { data: userNewsletters } = await supabase
      .from('newsletters')
      .select('title, content_markdown')
      .eq('user_id', user.id)

    const userTopics = userNewsletters?.map((n) => n.title).filter(Boolean) || []

    // Get competitor topics
    const { data: competitors } = await supabase
      .from('competitors')
      .select('id, name')
      .eq('user_id', user.id)

    const competitorTopics: any[] = []
    if (competitors) {
      for (const comp of competitors) {
        const { data: newsletters } = await supabase
          .from('competitor_newsletters')
          .select('subject_line, analysis')
          .eq('competitor_id', comp.id)
          .order('scraped_at', { ascending: false })
          .limit(20)

        if (newsletters) {
          newsletters.forEach((n) => {
            if (n.analysis?.main_topics) {
              competitorTopics.push({
                competitor: comp.name,
                topics: n.analysis.main_topics,
                subject: n.subject_line,
              })
            }
          })
        }
      }
    }

    // Get trending topics (mock for now - would integrate with Google Trends)
    const trendingTopics = [
      'AI Agents',
      'GPT-4 Vision',
      'Vector Databases',
      'RAG Applications',
      'AI Safety',
    ]

    // Find content gaps
    const gaps = await findContentGaps(userTopics, competitorTopics, trendingTopics)

    // Save to database
    const gapsToSave = gaps.map((gap: any) => ({
      user_id: user.id,
      topic: gap.topic,
      description: gap.description,
      opportunity_type: gap.gap_type,
      rationale: gap.rationale,
      priority_score: gap.priority_score,
      urgency: gap.urgency,
      status: 'open',
    }))

    // Delete old gaps
    await supabase.from('content_gaps').delete().eq('user_id', user.id)

    // Insert new gaps
    const { data: savedGaps } = await supabase.from('content_gaps').insert(gapsToSave).select()

    return NextResponse.json({ gaps: savedGaps })
  } catch (error: any) {
    console.error('Content gaps error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
