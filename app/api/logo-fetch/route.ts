import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { website } = await req.json()
    if (!website) return NextResponse.json({ error: 'No website provided' }, { status: 400 })

    // Clean the domain
    let domain = website.trim()
    if (!domain.startsWith('http')) domain = 'https://' + domain
    const url    = new URL(domain)
    const host   = url.hostname

    // Try multiple logo sources in order
    const sources = [
      `https://logo.clearbit.com/${host}`,
      `https://www.google.com/s2/favicons?domain=${host}&sz=128`,
      `https://icon.horse/icon/${host}`,
    ]

    for (const src of sources) {
      try {
        const res = await fetch(src, { signal: AbortSignal.timeout(3000) })
        if (res.ok && res.headers.get('content-type')?.startsWith('image')) {
          return NextResponse.json({ logoUrl: src, source: src })
        }
      } catch { continue }
    }

    return NextResponse.json({ logoUrl: null })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
