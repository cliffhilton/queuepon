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
      task = [
        `Write exactly 3 short ad headline options (each under 40 characters) for ${restaurantName || 'the restaurant'}, a ${restaurantType}.`,
        `Offer type: "${offerType}"${offerTitle ? `\nDraft headline the owner wrote: "${offerTitle}" — use as context only` : ''}`,
        ``,
        `Rules: name the restaurant in at least one option; plain specific language; no urgency phrases ("don't miss", "limited time", "before it's gone"); no all-caps words; no exclamation marks; no brand comparisons; use only facts the owner provided — do not add conditions, quantities, prices, times, or menu items they didn't state.`,
      ].join('\n')
      responseShape = '{"headlines":["headline 1","headline 2","headline 3"]}'
    } else if (mode === 'description') {
      task = offerTitle
        ? [
            `Restaurant: ${restaurantName || 'the restaurant'} (${restaurantType})`,
            `Headline: "${offerTitle}"`,
            ``,
            `Write exactly 1 description (under 100 characters). State what the offer is, using the restaurant name. No urgency language, no all-caps, no exclamation marks. Use only facts stated in the headline — do not add conditions, quantities, prices, times, or menu items not already there.`,
          ].join('\n')
        : `Write exactly 1 short description (under 100 characters) for a "${offerType}" offer at ${restaurantName || 'the restaurant'} (${restaurantType}). Plain language, no urgency phrases, no all-caps. Use only facts provided — do not invent conditions or details.`
      responseShape = '{"description":"description here"}'
    } else {
      task = [
        `For ${restaurantName || 'the restaurant'} (${restaurantType}), write:`,
        `1. Exactly 3 headline options (each under 40 characters)`,
        `2. Exactly 1 description (under 100 characters)`,
        ``,
        `Offer: "${offerType}"${offerTitle ? `\nDraft: "${offerTitle}" — use as context` : ''}`,
        ``,
        `Rules: name the restaurant in at least one headline; plain specific language; no urgency phrases; no all-caps; no exclamation marks; no brand comparisons; use only facts the owner provided — do not add conditions, quantities, prices, times, or menu items they didn't state.`,
      ].join('\n')
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