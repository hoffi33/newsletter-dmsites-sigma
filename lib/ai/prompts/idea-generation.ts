import { generateCompletion } from '../claude'

export async function generate52WeekIdeas(userContext: {
  niche: string
  audience: string
  goals: string
  frequency: string
}) {
  const systemPrompt = `You are an expert content strategist who generates highly relevant and engaging newsletter ideas.`

  const prompt = `Generate 52 weekly newsletter ideas for the following context:

NICHE: ${userContext.niche}
AUDIENCE: ${userContext.audience}
GOALS: ${userContext.goals}
FREQUENCY: ${userContext.frequency}

Requirements for each idea:
- Mix of different content types (educational, trending, seasonal, case studies, how-to)
- Timely and relevant throughout the year
- Consider seasonal events and trends
- Balance between evergreen and timely topics
- Prioritize based on value and urgency

Return a JSON array with 52 objects, each containing:
- week: number (1-52)
- topic: string (concise topic)
- suggested_headline: string (compelling headline)
- angle: string (unique perspective or approach)
- outline: string (brief 3-5 point outline)
- category: string (educational, trend, seasonal, case_study, how_to, etc)
- difficulty: string (easy, medium, hard)
- urgency: string (high, medium, low)
- priority_score: number (0.0-1.0, higher = more priority)
- rationale: string (why this topic is valuable)
- best_month: string (recommended month to publish)

Return ONLY valid JSON array.`

  const response = await generateCompletion(prompt, systemPrompt, 8000)

  try {
    return JSON.parse(response)
  } catch (e) {
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```\n([\s\S]*?)\n```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1])
    }
    throw new Error('Failed to parse ideas response')
  }
}

export async function generateDetailedOutline(topic: string, audience: string) {
  const systemPrompt = `You are an expert content strategist who creates detailed newsletter outlines.`

  const prompt = `Create a detailed outline for a newsletter about:

TOPIC: ${topic}
AUDIENCE: ${audience}

Return a JSON object with:
- hook: string (engaging opening hook)
- sections: array of objects with {title, key_points: array of strings}
- resources_needed: array of strings (research, examples, data needed)
- estimated_time_to_write: string (e.g., "2-3 hours")
- seo_keywords: array of strings
- related_topics: array of strings

Return ONLY valid JSON.`

  const response = await generateCompletion(prompt, systemPrompt, 3000)

  try {
    return JSON.parse(response)
  } catch (e) {
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```\n([\s\S]*?)\n```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1])
    }
    throw new Error('Failed to parse outline response')
  }
}
