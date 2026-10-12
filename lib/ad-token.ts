import crypto from 'crypto'

function signingSecret(): string {
  const s = process.env.AD_READY_SIGNING_SECRET
  if (!s) throw new Error('AD_READY_SIGNING_SECRET is not set')
  return s
}

export function generateAdReadyToken(offerId: string): string {
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 3600
  const payload = Buffer.from(JSON.stringify({ offerId, exp })).toString('base64url')
  const sig = crypto.createHmac('sha256', signingSecret()).update(payload).digest('hex')
  return `${payload}.${sig}`
}

export function verifyAdReadyToken(token: string): { offerId: string } | null {
  const dot = token.lastIndexOf('.')
  if (dot === -1) return null
  const payload = token.slice(0, dot)
  const sig     = token.slice(dot + 1)
  let expected: Buffer
  try {
    expected = Buffer.from(
      crypto.createHmac('sha256', signingSecret()).update(payload).digest('hex'), 'hex',
    )
  } catch { return null }
  let received: Buffer
  try { received = Buffer.from(sig, 'hex') } catch { return null }
  if (expected.length !== received.length) return null
  if (!crypto.timingSafeEqual(expected, received)) return null
  let data: any
  try { data = JSON.parse(Buffer.from(payload, 'base64url').toString()) } catch { return null }
  if (!data.offerId || typeof data.exp !== 'number') return null
  if (data.exp < Math.floor(Date.now() / 1000)) return null
  return { offerId: data.offerId }
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}
