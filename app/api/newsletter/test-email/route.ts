import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { newsletterId, recipientEmail } = await request.json()

    // Fetch newsletter
    const { data: newsletter, error: fetchError } = await supabase
      .from('newsletters')
      .select('*')
      .eq('id', newsletterId)
      .single()

    if (fetchError || !newsletter) {
      return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 })
    }

    // Send test email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'NewsletterAI <onboarding@resend.dev>',
      to: recipientEmail,
      subject: newsletter.selected_subject_line || newsletter.title || 'Test Newsletter',
      html: newsletter.content_html || `<div>${newsletter.content_markdown}</div>`,
    })

    if (emailError) {
      console.error('Email error:', emailError)
      return NextResponse.json({ error: emailError.message }, { status: 500 })
    }

    // Log test email
    await supabase.from('test_emails').insert({
      newsletter_id: newsletterId,
      user_id: user.id,
      recipient_email: recipientEmail,
      subject_line: newsletter.selected_subject_line || newsletter.title,
    })

    return NextResponse.json({ success: true, emailId: emailData?.id })
  } catch (error: any) {
    console.error('Test email error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
