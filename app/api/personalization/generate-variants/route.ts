import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCompletion } from '@/lib/ai/claude'

async function generatePersonalizedVariant(
  newsletter: any,
  segment: any
): Promise<{ subject_line: string; content: string; changes: string[] }> {
  const systemPrompt = `You are an expert at personalizing newsletter content for different audience segments.`

  const prompt = `Personalize this newsletter for the following audience segment:

SEGMENT: ${segment.name}
DESCRIPTION: ${segment.description}
INTERESTS: ${JSON.stringify(segment.criteria?.interests || [])}
BEHAVIOR: ${JSON.stringify(segment.criteria?.behavior || [])}

ORIGINAL NEWSLETTER:
Title: ${newsletter.title}
Content: ${newsletter.content_markdown}

Create a personalized version that:
1. Adjusts vocabulary and tone to match the segment
2. Includes examples relevant to their interests
3. Modifies technical depth based on their level
4. Adjusts CTAs to their behavior patterns

Return a JSON object with:
{
  "subject_line": "personalized subject line",
  "content_markdown": "full personalized newsletter in markdown",
  "changes_description": ["list of 3-5 key changes made"],
  "predicted_performance": {
    "open_rate_lift": "estimated % improvement",
    "engagement_score": "1-10 score"
  }
}

Return ONLY valid JSON.`

  const response = await generateCompletion(prompt, systemPrompt, 6000)

  try {
    const parsed = JSON.parse(response)
    return {
      subject_line: parsed.subject_line,
      content: parsed.content_markdown,
      changes: parsed.changes_description,
    }
  } catch (e) {
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```\n([\s\S]*?)\n```/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1])
      return {
        subject_line: parsed.subject_line,
        content: parsed.content_markdown,
        changes: parsed.changes_description,
      }
    }
    throw new Error('Failed to parse variant generation response')
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

    const { newsletterId, segmentIds } = await request.json()

    // Fetch newsletter
    const { data: newsletter } = await supabase
      .from('newsletters')
      .select('*')
      .eq('id', newsletterId)
      .single()

    if (!newsletter) {
      return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 })
    }

    // Fetch segments
    const { data: segments } = await supabase
      .from('audience_segments')
      .select('*')
      .in('id', segmentIds)

    if (!segments || segments.length === 0) {
      return NextResponse.json({ error: 'No segments found' }, { status: 404 })
    }

    // Generate variants for each segment
    const variants = []

    for (const segment of segments) {
      const variant = await generatePersonalizedVariant(newsletter, segment)

      // Save variant
      const { data: savedVariant } = await supabase
        .from('newsletter_variants')
        .insert({
          newsletter_id: newsletterId,
          segment_id: segment.id,
          variant_name: `${segment.name} Version`,
          subject_line: variant.subject_line,
          content_markdown: variant.content,
          content_html: variant.content, // TODO: Convert markdown to HTML
          changes_description: variant.changes.join('\n'),
          predicted_performance: {},
        })
        .select()
        .single()

      variants.push(savedVariant)
    }

    return NextResponse.json({ variants })
  } catch (error: any) {
    console.error('Variant generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
