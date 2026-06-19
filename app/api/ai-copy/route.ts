import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { restaurantName, restaurantType, offerType, zipCode, mode } = await req.json()

    if (!restaurantType || !offerType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const prompt = `You are a restaurant marketing copywriter. Generate offer copy for a local restaurant.

Restaurant: ${restaurantName || 'a local restaurant'}
Type: ${restaurantType}
Offer type: ${offerType}
Location: ZIP ${zipCode}

Generate exactly 3 headline options (each under 40 characters) and 1 description (under 100 characters) for a "${offerType}" promotion. 

Tone: ${mode === 'urgent' ? 'urgent, time-sensitive' : mode === 'friendly' ? 'warm, friendly, conversational' : mode === 'value' ? 'value-focused, practical' : 'punchy and appetizing'}

Return ONLY valid JSON in this exact format, no markdown, no explanation:
{
  "headlines": ["headline 1", "headline 2", "headline 3"],
  "description": "one description here"
}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    const text = data.content?.[0]?.text ?? ''

    // Strip markdown fences if present
    const cleaned = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return NextResponse.json(parsed)

  } catch (err: any) {
    console.error('AI copy generation error:', err)
    return NextResponse.json({ error: 'Failed to generate copy' }, { status: 500 })
  }
}
