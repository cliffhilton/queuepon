#!/usr/bin/env node
// Sends all five customer/cron email templates to the test inbox.
// Usage: node scripts/test-all-emails.mjs
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../.env.local')
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
}

const { Resend } = await import('resend')
const resend = new Resend(process.env.RESEND_API_KEY)
const FROM    = process.env.RESEND_FROM_EMAIL || 'hello@queuepon.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://queuepon.com'
const TO      = 'cliffhilton@gmail.com'

const DEFAULT_HERO   = 'https://dvxmwudqmpyudfggmadm.supabase.co/storage/v1/object/public/offer-images/default/531196a9-de9b-45dd-8d3e-19c528e9b8c1.jpg'
const BIRTHDAY_HERO  = 'https://dvxmwudqmpyudfggmadm.supabase.co/storage/v1/object/public/offer-images/default/birthday-offer.png'
const LOGO_WHITE     = 'https://dvxmwudqmpyudfggmadm.supabase.co/storage/v1/object/public/logos/queuepon-logo-WH-web.png'

// ── HTML helpers (mirrors lib/resend.ts) ──────────────────────────────────────
function emailWrap(rows) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0ebe3;">
<center>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f0ebe3">
<tr><td align="center" style="padding:24px 0;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#fdfaf7" style="max-width:600px;width:100%;">
${rows}
</table></td></tr></table></center>
</body></html>`
}
const eHeader = () => `<tr><td bgcolor="#588aad" align="center" style="padding:18px 0;">
  <img src="${LOGO_WHITE}" alt="Queuepon" height="40" style="height:40px;width:auto;display:inline-block;border:0;"/>
</td></tr>`

const eBranding = (name, logoUrl, address) => {
  const logo = logoUrl
    ? `<img src="${logoUrl}" alt="${name}" width="52" height="52" style="width:52px;height:52px;object-fit:contain;border-radius:8px;display:block;border:0;"/>`
    : `<div style="width:52px;height:52px;background:#ddeef8;border-radius:8px;text-align:center;line-height:52px;font-size:24px;display:inline-block;">🍽️</div>`
  return `<tr><td bgcolor="#f7f2ec" style="border-bottom:1px solid #ede5db;padding:16px 24px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="vertical-align:middle;padding-right:14px;">${logo}</td>
    <td style="vertical-align:middle;">
      <div style="font-size:17px;font-weight:700;color:#716559;font-family:'Helvetica Neue',Arial,sans-serif;">${name}</div>
      ${address ? `<div style="font-size:13px;color:#9e8e83;margin-top:3px;font-family:'Helvetica Neue',Arial,sans-serif;">${address}</div>` : ''}
    </td>
  </tr></table>
</td></tr>`
}

const eHero = (src, alt) => `<tr><td style="line-height:0;font-size:0;padding:0;">
  <img src="${src}" alt="${alt}" width="600" style="width:100%;max-width:600px;height:auto;display:block;border:0;"/>
</td></tr>`

const eOfferBox = (pill, title, extra) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:2px dashed #588aad;border-radius:12px;background:#E6F1FB;margin-bottom:28px;">
  <tr><td style="padding:24px;text-align:center;">
    <div style="display:inline-block;background:#588aad;color:#ffffff;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:4px 14px;border-radius:20px;margin-bottom:12px;font-family:'Helvetica Neue',Arial,sans-serif;">${pill}</div>
    <div style="font-family:'Poppins','Helvetica Neue',Arial,sans-serif;font-size:22px;font-weight:700;color:#1a3a52;line-height:1.3;">${title}</div>
    ${extra ? `<div style="margin-top:10px;font-family:'Helvetica Neue',Arial,sans-serif;">${extra}</div>` : ''}
  </td></tr>
</table>`

const eCTA = (href, label) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
  <tr><td style="text-align:center;">
    <a href="${href}" style="display:inline-block;background:#588aad;color:#ffffff;font-family:'Helvetica Neue',Arial,sans-serif;font-weight:700;font-size:16px;padding:16px 36px;border-radius:12px;text-decoration:none;letter-spacing:0.3px;">${label}</a>
  </td></tr>
</table>`

const eFooter = (sourceUrl) => {
  const base = sourceUrl.split('?')[0]
  return `<tr><td bgcolor="#f0ebe3" style="border-top:1px solid #ede5db;padding:20px 24px;text-align:center;">
  <p style="font-size:12px;color:#9e8e83;margin:0;line-height:1.8;font-family:'Helvetica Neue',Arial,sans-serif;">
    You received this because you signed up for offers at <a href="${base}" style="color:#9e8e83;">${base}</a>.<br/>
    <a href="#" style="color:#9e8e83;text-decoration:underline;">Unsubscribe</a> &nbsp;·&nbsp; Powered by <a href="https://queuepon.com" style="color:#588aad;text-decoration:none;">Queuepon</a>
  </p>
</td></tr>`
}

// ── Sample data ───────────────────────────────────────────────────────────────
const restaurant = "Joe's Pizza"
const firstName  = 'Cliff'
const address    = '742 Evergreen Terrace, Louisville, KY 40202'
const offerTitle = 'Free Appetizer with Any Entree'
const landingUrl = `${APP_URL}/offers/joes-pizza-free-appetizer?email=${encodeURIComponent(TO)}`
const dashUrl    = `${APP_URL}/dashboard/offers`

// ── Send all five ─────────────────────────────────────────────────────────────
const emails = [
  // 1. Day 3 customer — Reminder
  {
    label: 'Day 3 customer (Reminder)',
    from: `${restaurant} via Queuepon <${FROM}>`,
    subject: `Don't forget — your ${offerTitle} offer is still waiting, ${firstName}`,
    html: emailWrap(`
      ${eHeader()}
      ${eBranding(restaurant, null, address)}
      ${eHero(DEFAULT_HERO, restaurant)}
      <tr><td style="padding:36px 32px 28px;font-family:'Helvetica Neue',Arial,sans-serif;">
        <h1 style="font-family:'Poppins','Helvetica Neue',Arial,sans-serif;font-size:24px;font-weight:700;color:#716559;margin:0 0 14px;line-height:1.3;">
          Still thinking about it, ${firstName}? 👋
        </h1>
        <p style="font-size:17px;color:#9e8e83;line-height:1.7;margin:0 0 24px;">
          Your <strong style="color:#716559;">${offerTitle}</strong> offer from
          <strong style="color:#716559;">${restaurant}</strong> is still waiting.
          Stop in this week and show this email at the counter — no printing needed.
        </p>
        ${eOfferBox('YOUR OFFER', offerTitle)}
        ${eCTA(landingUrl, 'Redeem My Offer →')}
        <p style="font-size:17px;color:#716559;line-height:1.7;margin:0;">See you soon,<br/><strong>${restaurant}</strong></p>
      </td></tr>
      ${eFooter(landingUrl)}
    `),
  },

  // 2. Day 10 customer — Bring a Friend
  {
    label: 'Day 10 customer (Bring a Friend)',
    from: `${restaurant} via Queuepon <${FROM}>`,
    subject: `Know someone who'd love ${restaurant}? Share your offer`,
    html: emailWrap(`
      ${eHeader()}
      ${eBranding(restaurant, null, address)}
      ${eHero(DEFAULT_HERO, restaurant)}
      <tr><td style="padding:36px 32px 28px;font-family:'Helvetica Neue',Arial,sans-serif;">
        <h1 style="font-family:'Poppins','Helvetica Neue',Arial,sans-serif;font-size:24px;font-weight:700;color:#716559;margin:0 0 14px;line-height:1.3;">
          Hey ${firstName} — your offer is still valid! 🎉
        </h1>
        <p style="font-size:17px;color:#9e8e83;line-height:1.7;margin:0 0 24px;">
          You claimed your <strong style="color:#716559;">${offerTitle}</strong> from
          <strong style="color:#716559;">${restaurant}</strong>.
          Know a friend who'd love it? Share the link below and they can grab the same deal.
        </p>
        ${eOfferBox('STILL VALID', offerTitle, `<div style="font-size:12px;color:#716559;margin-top:10px;font-weight:600;">Expires October 15, 2026</div>`)}
        <p style="font-size:14px;color:#9e8e83;line-height:1.7;margin:0 0 20px;">
          Share this link with friends:<br/>
          <a href="${APP_URL}/offers/joes-pizza-free-appetizer" style="color:#588aad;word-break:break-all;">${APP_URL}/offers/joes-pizza-free-appetizer</a>
        </p>
        ${eCTA(landingUrl, 'View My Offer →')}
        <p style="font-size:17px;color:#716559;line-height:1.7;margin:0;">Cheers,<br/><strong>${restaurant}</strong></p>
      </td></tr>
      ${eFooter(landingUrl)}
    `),
  },

  // 3. Day 25 customer — Come Back
  {
    label: 'Day 25 customer (Come Back)',
    from: `${restaurant} via Queuepon <${FROM}>`,
    subject: `We miss you, ${firstName} — a special offer just for you`,
    html: emailWrap(`
      ${eHeader()}
      ${eBranding(restaurant, null, address)}
      ${eHero(DEFAULT_HERO, restaurant)}
      <tr><td style="padding:36px 32px 28px;font-family:'Helvetica Neue',Arial,sans-serif;">
        <h1 style="font-family:'Poppins','Helvetica Neue',Arial,sans-serif;font-size:24px;font-weight:700;color:#716559;margin:0 0 14px;line-height:1.3;">
          We miss you, ${firstName}! 🥺
        </h1>
        <p style="font-size:17px;color:#9e8e83;line-height:1.7;margin:0 0 24px;">
          It's been a while since your last visit to
          <strong style="color:#716559;">${restaurant}</strong>.
          We're holding something special just for you:
        </p>
        ${eOfferBox('WELCOME BACK OFFER', '10% off your next visit')}
        ${eCTA(landingUrl, 'Redeem My Offer →')}
        <p style="font-size:17px;color:#716559;line-height:1.7;margin:0;">Hope to see you soon,<br/><strong>${restaurant}</strong></p>
      </td></tr>
      ${eFooter(landingUrl)}
    `),
  },

  // 4. Day 3 owner — Come Back setup prompt
  {
    label: 'Day 3 owner (Come Back setup)',
    from: `Queuepon <${FROM}>`,
    subject: `Next step for ${restaurant}: set up your Come Back offer`,
    html: emailWrap(`
      ${eHeader()}
      ${eBranding(restaurant, null, address)}
      ${eHero(DEFAULT_HERO, restaurant)}
      <tr><td style="padding:36px 32px 28px;font-family:'Helvetica Neue',Arial,sans-serif;">
        <h1 style="font-family:'Poppins','Helvetica Neue',Arial,sans-serif;font-size:24px;font-weight:700;color:#716559;margin:0 0 14px;line-height:1.3;">
          One more thing, ${firstName} 🙌
        </h1>
        <p style="font-size:17px;color:#9e8e83;line-height:1.7;margin:0 0 24px;">
          Your campaign is live and customers are opting in.
          Now set up your <strong style="color:#716559;">Come Back offer</strong> — the automated
          Day 25 email that brings first-time visitors back for a second visit, on autopilot.
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:2px dashed #588aad;border-radius:12px;background:#E6F1FB;margin-bottom:28px;">
          <tr><td style="padding:24px;">
            <div style="display:inline-block;background:#588aad;color:#ffffff;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:4px 14px;border-radius:20px;margin-bottom:16px;font-family:'Helvetica Neue',Arial,sans-serif;">ACTION NEEDED</div>
            <div style="font-family:'Poppins','Helvetica Neue',Arial,sans-serif;font-size:17px;font-weight:700;color:#1a3a52;margin-bottom:14px;">Set up your Come Back offer in 2 minutes</div>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              ${[
                ['📅','Fires automatically 25 days after each customer signs up'],
                ['🎁','Give them a reason to return — discount, free item, whatever works'],
                ['🤖','No extra work once configured — runs on autopilot forever'],
              ].map(([icon, text]) => `<tr>
                <td style="vertical-align:top;padding-right:10px;font-size:16px;padding-bottom:10px;">${icon}</td>
                <td style="font-size:14px;color:#588aad;line-height:1.5;padding-bottom:10px;font-family:'Helvetica Neue',Arial,sans-serif;">${text}</td>
              </tr>`).join('')}
            </table>
          </td></tr>
        </table>
        ${eCTA(dashUrl, 'Set Up My Come Back Offer →')}
        <p style="font-size:17px;color:#716559;line-height:1.7;margin:0;">Here for you,<br/><strong>The Queuepon Team</strong></p>
        <p style="font-size:13px;color:#9e8e83;margin-top:16px;">
          Questions? Reply to this email or reach us at
          <a href="mailto:hello@queuepon.com" style="color:#588aad;text-decoration:none;">hello@queuepon.com</a>
        </p>
      </td></tr>
      <tr><td bgcolor="#f0ebe3" style="border-top:1px solid #ede5db;padding:20px 24px;text-align:center;">
        <p style="font-size:12px;color:#9e8e83;margin:0;line-height:1.8;font-family:'Helvetica Neue',Arial,sans-serif;">
          Powered by <a href="https://queuepon.com" style="color:#588aad;text-decoration:none;">Queuepon</a> · hello@queuepon.com
        </p>
      </td></tr>
    `),
  },

  // 5. Birthday
  {
    label: 'Birthday',
    from: `${restaurant} via Queuepon <${FROM}>`,
    subject: `🎂 Happy birthday, ${firstName}! A gift from ${restaurant}`,
    html: emailWrap(`
      ${eHeader()}
      ${eBranding(restaurant, null, address)}
      ${eHero(BIRTHDAY_HERO, restaurant)}
      <tr><td style="padding:36px 32px 28px;font-family:'Helvetica Neue',Arial,sans-serif;">
        <h1 style="font-family:'Poppins','Helvetica Neue',Arial,sans-serif;font-size:24px;font-weight:700;color:#716559;margin:0 0 14px;line-height:1.3;">
          Happy birthday, ${firstName}! 🎉
        </h1>
        <p style="font-size:17px;color:#9e8e83;line-height:1.7;margin:0 0 24px;">
          Everyone at <strong style="color:#716559;">${restaurant}</strong> is wishing you
          the very best this month. To celebrate, we've got something special just for you —
          no candles required.
        </p>
        ${eOfferBox('BIRTHDAY OFFER', 'Free Dessert on Your Birthday')}
        ${eCTA(landingUrl, 'Redeem Your Birthday Offer')}
        <p style="font-size:17px;color:#716559;line-height:1.7;margin:0;">Here's to a great one,<br/><strong>${restaurant}</strong></p>
      </td></tr>
      ${eFooter(landingUrl)}
    `),
  },
]

let ok = 0
for (const e of emails) {
  const { data, error } = await resend.emails.send({ from: e.from, to: TO, subject: e.subject, html: e.html })
  if (error) {
    console.error(`❌ [${e.label}]`, error)
  } else {
    console.log(`✅ [${e.label}] id=${data.id}`)
    ok++
  }
}

console.log(`\n${ok}/${emails.length} sent to ${TO}`)
