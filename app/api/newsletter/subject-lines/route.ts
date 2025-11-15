import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSubjectLines } from '@/lib/ai/claude'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { newsletterId } = await request.json()

    // Fetch newsletter
    const { data: newsletter, error: fetchError } = await supabase
      .from('newsletters')
      .select('*')
      .eq('id', newsletterId)
      .single()

    if (fetchError || !newsletter) {
      return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 })
    }

    // Generate subject lines
    const result = await generateSubjectLines(newsletter.content_markdown, newsletter.title)

    // Update newsletter with subject lines
    const { error: updateError } = await supabase
      .from('newsletters')
      .update({
        subject_lines: result.subject_lines,
      })
      .eq('id', newsletterId)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ subjectLines: result.subject_lines })
  } catch (error: any) {
    console.error('Subject line generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
