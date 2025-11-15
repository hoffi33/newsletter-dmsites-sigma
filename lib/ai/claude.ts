import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function generateCompletion(
  prompt: string,
  systemPrompt?: string,
  maxTokens: number = 4000
): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const textContent = message.content.find((block) => block.type === 'text')
  return textContent && 'text' in textContent ? textContent.text : ''
}

export async function analyzeContent(transcript: string, sourceType: string) {
  const systemPrompt = `You are an expert content analyst. Analyze the provided content and extract key information for newsletter creation.`

  const prompt = `Analyze this ${sourceType} content and provide a detailed analysis in JSON format:

${transcript}

Return a JSON object with:
- main_topic: string (the primary topic)
- sub_topics: array of strings (3-5 subtopics)
- key_takeaways: array of strings (5-7 main points)
- quotes: array of strings (3-5 memorable quotes or statements)
- examples: array of objects with {title, description}
- target_audience: string (who would benefit from this)
- audience_level: string (beginner, intermediate, advanced)
- pain_points: array of strings (problems this content addresses)
- suggested_ctas: array of strings (3 call-to-action ideas)
- sentiment: string (positive, neutral, informative, etc)
- difficulty: string (easy, medium, hard)

Return ONLY valid JSON, no markdown or explanation.`

  const response = await generateCompletion(prompt, systemPrompt, 4000)

  try {
    return JSON.parse(response)
  } catch (e) {
    // If JSON parsing fails, try to extract JSON from markdown code blocks
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```\n([\s\S]*?)\n```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1])
    }
    throw new Error('Failed to parse AI response as JSON')
  }
}

export async function generateNewsletter(
  analysis: any,
  transcript: string,
  options: {
    tone: string
    length: string
    structure: string
  }
) {
  const systemPrompt = `You are an expert newsletter writer. Create engaging, well-structured newsletters based on content analysis.`

  const prompt = `Create a newsletter based on this content analysis:

ANALYSIS:
${JSON.stringify(analysis, null, 2)}

ORIGINAL CONTENT (for reference):
${transcript.substring(0, 3000)}...

REQUIREMENTS:
- Tone: ${options.tone}
- Length: ${options.length} (short=300-500 words, medium=500-800 words, long=800-1200 words)
- Structure: ${options.structure}

Return a JSON object with:
- title: string (catchy newsletter title)
- content_markdown: string (full newsletter in markdown format with proper headings, lists, bold, etc)
- word_count: number
- reading_time_minutes: number

Structure guidelines:
- Hook: Start with an engaging opening
- Main content: Organize with clear sections
- Examples: Include relevant examples from the content
- Actionable takeaways: End with clear next steps
- CTA: Include a compelling call-to-action

Return ONLY valid JSON.`

  const response = await generateCompletion(prompt, systemPrompt, 6000)

  try {
    return JSON.parse(response)
  } catch (e) {
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```\n([\s\S]*?)\n```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1])
    }
    throw new Error('Failed to parse newsletter generation response')
  }
}

export async function generateSubjectLines(newsletterContent: string, title: string) {
  const systemPrompt = `You are an expert email marketer specializing in subject lines.`

  const prompt = `Generate 5 compelling subject lines for this newsletter:

TITLE: ${title}

CONTENT:
${newsletterContent.substring(0, 1000)}...

Generate subject lines that are:
- Engaging and curiosity-inducing
- Clear about the value
- Optimized for open rates
- Mix of different styles (question, benefit-driven, curiosity, urgency, personal)

Return a JSON object with:
- subject_lines: array of objects with {text, style, estimated_open_rate}

Return ONLY valid JSON.`

  const response = await generateCompletion(prompt, systemPrompt, 2000)

  try {
    return JSON.parse(response)
  } catch (e) {
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```\n([\s\S]*?)\n```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1])
    }
    throw new Error('Failed to parse subject lines response')
  }
}
