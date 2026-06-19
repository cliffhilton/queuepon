import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { restaurantName, restaurantType, offerType, zipCode, offerTitle, generate } = await req.json()

    if (!restaurantType || !offerType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const mode = generate || 'both'

    let task = ''
    let responseShape = ''

    if (mode === 'headlines') {
      task = `Generate exactly 3 short headline options (each under 40 characters) for this "${offerType}" promotion.`
      responseShape = '{"headlines":["headline 1","headline 2","headline 3"]}'
    } else if (mode === 'description') {
      task = offerTitle
        ? `The restaurant's exact offer headline is: "${offerTitle}"

Write exactly 1 short, appetizing description (under 100 characters) that describes and elaborates on THIS SPECIFIC OFFER — "${offerTitle}". The description must directly relate to and expand on what's stated in the headline. Do not write a generic offer description — it must clearly connect to "${offerTitle}".`
        : `Generate exactly 1 short, appetizing description (under 100 characters) for a "${offerType}" promotion.`
      responseShape = '{"description":"description here"}'
    } else {
      task = `Generate exactly 3 short headline options (each under 40 characters) and 1 short description (under 100 characters) for this "${offerType}" promotion.`
      responseShape = '{"headlines":["headline 1","headline 2","headline 3"],"description":"description here"}'
    }

    const prompt = `Generate restaurant offer marketing copy.

Restaurant: ${restaurantName || 'a local restaurant'}
Type: ${restaurantType}
Offer type: ${offerType}
ZIP: ${zipCode}

${task}

Respond with ONLY this JSON object and nothing else — no markdown formatting, no code fences, no explanation before or after:
${responseShape}`

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not set')
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Anthropic API error:', response.status, errText)
      return NextResponse.json({ error: `AI request failed: ${response.status}` }, { status: 500 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text ?? ''
    console.log('Claude raw response:', text, '| Input offerTitle was:', offerTitle)

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No JSON found in response:', text)
      return NextResponse.json({ error: 'AI returned unexpected format' }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json(parsed)

  } catch (err: any) {
    console.error('AI copy generation error:', err.message)
    return NextResponse.json({ error: err.message || 'Failed to generate copy' }, { status: 500 })
  }
}