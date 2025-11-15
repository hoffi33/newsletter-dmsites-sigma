import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generate52WeekIdeas } from '@/lib/ai/prompts/idea-generation'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { niche, audience, goals, frequency } = await request.json()

    // Generate ideas with AI
    const ideas = await generate52WeekIdeas({ niche, audience, goals, frequency })

    // Save to database
    const ideasToInsert = ideas.map((idea: any) => ({
      user_id: user.id,
      topic: idea.topic,
      suggested_headline: idea.suggested_headline,
      angle: idea.angle,
      outline: idea.outline,
      category: idea.category,
      difficulty: idea.difficulty,
      urgency: idea.urgency,
      priority_score: idea.priority_score,
      rationale: {
        reason: idea.rationale,
        best_month: idea.best_month,
        week: idea.week,
      },
      status: 'suggested',
    }))

    const { data: savedIdeas, error } = await supabase
      .from('content_ideas')
      .insert(ideasToInsert)
      .select()

    if (error) {
      console.error('Save ideas error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ideas: savedIdeas })
  } catch (error: any) {
    console.error('Generate ideas error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
