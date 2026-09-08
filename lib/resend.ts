import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)
const FROM    = process.env.RESEND_FROM_EMAIL || 'hello@queuepon.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://queuepon.com'

const DEFAULT_HERO = 'https://dvxmwudqmpyudfggmadm.supabase.co/storage/v1/object/public/offer-images/default/531196a9-de9b-45dd-8d3e-19c528e9b8c1.png'
const LOGO_WHITE   = 'https://dvxmwudqmpyudfggmadm.supabase.co/storage/v1/object/public/logos/queuepon-logo-WH-web.png'

// ── Shared email template helpers ──────────────────────────────────────────────
function emailWrap(rows: string): string {
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

function eHeader(): string {
  return `<tr><td bgcolor="#588aad" align="center" style="padding:18px 0;">
  <img src="${LOGO_WHITE}" alt="Queuepon" height="40" style="height:40px;width:auto;display:inline-block;border:0;"/>
</td></tr>`
}

function eBranding(restaurantName: string, logoUrl?: string, address?: string): string {
  const logo = logoUrl
    ? `<img src="${logoUrl}" alt="${restaurantName}" width="52" height="52" style="width:52px;height:52px;object-fit:contain;border-radius:8px;display:block;border:0;"/>`
    : `<div style="width:52px;height:52px;background:#ddeef8;border-radius:8px;text-align:center;line-height:52px;font-size:24px;display:inline-block;">🍽️</div>`
  return `<tr><td bgcolor="#f7f2ec" style="border-bottom:1px solid #ede5db;padding:16px 24px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="vertical-align:middle;padding-right:14px;">${logo}</td>
    <td style="vertical-align:middle;">
      <div style="font-size:17px;font-weight:700;color:#716559;font-family:'Helvetica Neue',Arial,sans-serif;">${restaurantName}</div>
      ${address ? `<div style="font-size:13px;color:#9e8e83;margin-top:3px;font-family:'Helvetica Neue',Arial,sans-serif;">${address}</div>` : ''}
    </td>
  </tr></table>
</td></tr>`
}

function eHero(src: string, alt: string): string {
  return `<tr><td style="line-height:0;font-size:0;padding:0;">
  <img src="${src}" alt="${alt}" width="600" style="width:100%;max-width:600px;height:auto;display:block;border:0;"/>
</td></tr>`
}

function eOfferBox(pill: string, title: string, description?: string, extra?: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:2px dashed #588aad;border-radius:12px;background:#E6F1FB;margin-bottom:28px;">
  <tr><td style="padding:24px;text-align:center;">
    <div style="display:inline-block;background:#588aad;color:#ffffff;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:4px 14px;border-radius:20px;margin-bottom:12px;font-family:'Helvetica Neue',Arial,sans-serif;">${pill}</div>
    <div style="font-family:'Poppins','Helvetica Neue',Arial,sans-serif;font-size:22px;font-weight:700;color:#1a3a52;line-height:1.3;">${title}</div>
    ${description ? `<div style="font-size:14px;color:#588aad;margin-top:8px;font-family:'Helvetica Neue',Arial,sans-serif;">${description}</div>` : ''}
    ${extra ? `<div style="margin-top:10px;font-family:'Helvetica Neue',Arial,sans-serif;">${extra}</div>` : ''}
  </td></tr>
</table>`
}

function eCTA(href: string, label: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
  <tr><td style="text-align:center;">
    <a href="${href}" style="display:inline-block;background:#588aad;color:#ffffff;font-family:'Helvetica Neue',Arial,sans-serif;font-weight:700;font-size:16px;padding:16px 36px;border-radius:12px;text-decoration:none;letter-spacing:0.3px;">${label}</a>
  </td></tr>
</table>`
}

function eFooter(sourceUrl: string): string {
  const base = sourceUrl.split('?')[0]
  return `<tr><td bgcolor="#f0ebe3" style="border-top:1px solid #ede5db;padding:20px 24px;text-align:center;">
  <p style="font-size:12px;color:#9e8e83;margin:0;line-height:1.8;font-family:'Helvetica Neue',Arial,sans-serif;">
    You received this because you signed up for offers at <a href="${base}" style="color:#9e8e83;">${base}</a>.<br/>
    <a href="#" style="color:#9e8e83;text-decoration:underline;">Unsubscribe</a> &nbsp;·&nbsp; Powered by <a href="https://queuepon.com" style="color:#588aad;text-decoration:none;">Queuepon</a>
  </p>
</td></tr>`
}

export async function sendRestaurantWelcome({
  to, firstName, restaurantName, plan, zipCode,
}: {
  to: string; firstName: string; restaurantName: string; plan: string; zipCode: string
}) {
  const planNames: Record<string, string> = { grow:'Grow', expand:'Expand', thrive:'Thrive' }
  return resend.emails.send({
    from: `Queuepon <${FROM}>`,
    to,
    subject: `You're live on Queuepon, ${firstName}! Here's how to access your dashboard.`,
    html: `
      <div style="font-family:'Helvetica Neue',sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fdfaf7;color:#716557">
        <img src="https://dvxmwudqmpyudfggmadm.supabase.co/storage/v1/object/public/logos/queuepon-logo-web.png" alt="Queuepon" style="height:36px;width:auto;display:block;margin-bottom:28px;" />
        <h1 style="font-size:26px;font-weight:700;color:#716557;margin:0 0 12px">Welcome to Queuepon, ${firstName}! 🎉</h1>
        <p style="color:#9e8e83;line-height:1.7;margin:0 0 24px">
          <strong style="color:#716557">${restaurantName}</strong> is now live on the 
          <strong style="color:#588aad">${planNames[plan] ?? plan} Plan</strong>. 
          Your Meta ad is being set up for ZIP <strong>${zipCode}</strong> and goes live within 24 hours.
        </p>
        <div style="background:#e8f2f8;border-radius:12px;padding:20px 24px;margin-bottom:24px">
          <p style="margin:0 0 8px;font-weight:700;color:#2a5070">Access your dashboard</p>
          <p style="margin:0 0 16px;font-size:14px;color:#588aad">
            Log in at <a href="${APP_URL}/login" style="color:#588aad">${APP_URL}/login</a>
          </p>
          <p style="margin:0;font-size:13px;color:#716557">
            Use your email: <strong>${to}</strong><br/>
            Check your inbox for a separate email to set your password.
          </p>
        </div>
        <div style="border-top:1px solid #ede5db;padding-top:20px">
          <p style="font-size:13px;color:#9e8e83;margin:0 0 4px">What happens next:</p>
          <ul style="font-size:13px;color:#716557;line-height:2;padding-left:20px;margin:8px 0">
            <li>Set your password using the link in your next email</li>
            <li>Your Meta ad goes live within 24 hours targeting ZIP ${zipCode}</li>
            <li>Share your offer landing page to start collecting customer emails</li>
          </ul>
        </div>
        <p style="font-size:13px;color:#9e8e83;margin-top:24px">
          Questions? Reply to this email or reach us at hello@queuepon.com
        </p>
      </div>
    `,
  })
}

export async function sendWelcomeAndPasswordEmail({
  to, firstName, restaurantName, plan, zipCode, setupUrl,
}: {
  to: string; firstName: string; restaurantName: string
  plan: string; zipCode: string; setupUrl: string
}) {
  const planNames: Record<string, string> = { grow: 'Grow', expand: 'Expand', thrive: 'Thrive' }
  return resend.emails.send({
    from: `Queuepon <${FROM}>`,
    to,
    subject: `Welcome to Queuepon, ${firstName}! Set your password to get started.`,
    html: `
      <div style="font-family:'Helvetica Neue',sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fdfaf7;color:#716557">
        <img src="https://dvxmwudqmpyudfggmadm.supabase.co/storage/v1/object/public/logos/queuepon-logo-web.png" alt="Queuepon" style="height:36px;width:auto;display:block;margin-bottom:28px;" />
        <h1 style="font-size:28px;font-weight:700;color:#716557;margin:0 0 16px">Welcome to Queuepon, ${firstName}! 🎉</h1>
        <p style="color:#9e8e83;line-height:1.7;margin:0 0 16px">
          <strong style="color:#716557">${restaurantName}</strong> is now live on the
          <strong style="color:#588aad">${planNames[plan] ?? plan} Plan</strong>.
          Your Meta ad is being set up for ZIP <strong style="color:#716557">${zipCode}</strong> and goes live within 24 hours.
        </p>
        <p style="color:#9e8e83;line-height:1.7;margin:0 0 28px">
          Your <strong style="color:#716557">${restaurantName}</strong> account is ready.
          Click below to set your password and access your dashboard.
        </p>
        <div style="text-align:center;margin:32px 0">
          <a href="${setupUrl}" style="background:#588aad;color:white;font-weight:700;padding:16px 36px;border-radius:14px;text-decoration:none;font-size:16px;display:inline-block">
            Set My Password →
          </a>
        </div>
        <p style="font-size:13px;color:#9e8e83;text-align:center;margin:0 0 28px">This link expires in 24 hours.</p>
        <div style="background:#e8f2f8;border-radius:12px;padding:20px 24px;margin-bottom:24px">
          <p style="margin:0 0 8px;font-weight:700;color:#2a5070">Access your dashboard</p>
          <p style="margin:0 0 12px;font-size:14px">
            Log in at <a href="${APP_URL}/login" style="color:#588aad">${APP_URL}/login</a>
          </p>
          <p style="margin:0;font-size:13px;color:#716557">
            Use your email: <a href="mailto:${to}" style="color:#588aad">${to}</a>
          </p>
        </div>
        <p style="font-size:13px;color:#9e8e83;margin-top:24px">
          Questions? Reply to this email or reach us at
          <a href="mailto:hello@queuepon.com" style="color:#588aad">hello@queuepon.com</a>
        </p>
      </div>
    `,
  })
}

export async function sendPasswordSetupEmail({
  to, firstName, restaurantName, setupUrl,
}: {
  to: string; firstName: string; restaurantName: string; setupUrl: string
}) {
  return resend.emails.send({
    from: `Queuepon <${FROM}>`,
    to,
    subject: `Set your password to access your ${restaurantName} dashboard`,
    html: `
      <div style="font-family:'Helvetica Neue',sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fdfaf7;color:#716557">
        <img src="https://dvxmwudqmpyudfggmadm.supabase.co/storage/v1/object/public/logos/queuepon-logo-web.png" alt="Queuepon" style="height:36px;width:auto;display:block;margin-bottom:28px;" />
        <h1 style="font-size:24px;font-weight:700;color:#716557;margin:0 0 12px">One more step, ${firstName} 👋</h1>
        <p style="color:#9e8e83;line-height:1.7;margin:0 0 24px">
          Your <strong style="color:#716557">${restaurantName}</strong> account is ready. 
          Click below to set your password and access your dashboard.
        </p>
        <div style="text-align:center;margin:32px 0">
          <a href="${setupUrl}" style="background:#588aad;color:white;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:16px;display:inline-block">
            Set My Password →
          </a>
        </div>
        <p style="font-size:13px;color:#9e8e83;line-height:1.7">
          This link expires in 24 hours. If you didn't create a Queuepon account, ignore this email.
        </p>
        <p style="font-size:12px;color:#9e8e83;margin-top:24px">
          Questions? Reply to this email or reach us at hello@queuepon.com
        </p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail({
  to, resetUrl,
}: {
  to: string; resetUrl: string
}) {
  return resend.emails.send({
    from: `Queuepon <${FROM}>`,
    to,
    subject: `Reset your Queuepon password`,
    html: `
      <div style="font-family:'Helvetica Neue',sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fdfaf7;color:#716557">
        <img src="https://dvxmwudqmpyudfggmadm.supabase.co/storage/v1/object/public/logos/queuepon-logo-web.png" alt="Queuepon" style="height:36px;width:auto;display:block;margin-bottom:28px;" />
        <h1 style="font-size:24px;font-weight:700;color:#716557;margin:0 0 12px">Reset your password</h1>
        <p style="color:#9e8e83;line-height:1.7;margin:0 0 24px">
          We received a request to reset your Queuepon password. Click below to choose a new one.
        </p>
        <div style="text-align:center;margin:32px 0">
          <a href="${resetUrl}" style="background:#588aad;color:white;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:16px;display:inline-block">
            Reset My Password →
          </a>
        </div>
        <p style="font-size:13px;color:#9e8e83;line-height:1.7">
          This link expires in 24 hours. If you didn't request a password reset, ignore this email — your account is safe.
        </p>
        <p style="font-size:12px;color:#9e8e83;margin-top:24px">
          Questions? Reach us at <a href="mailto:hello@queuepon.com" style="color:#588aad">hello@queuepon.com</a>
        </p>
      </div>
    `,
  })
}

export async function sendCustomerOfferEmail({
  to, firstName, restaurantName, offerTitle, offerDescription, landingPageUrl,
}: {
  to: string; firstName: string; restaurantName: string
  offerTitle: string; offerDescription: string; landingPageUrl: string
}) {
  return resend.emails.send({
    from: `${restaurantName} via Queuepon <${FROM}>`,
    to,
    subject: `Here's your ${offerTitle} from ${restaurantName} 🎉`,
    html: `
      <div style="font-family:'Helvetica Neue',sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#716557">
        <h1 style="color:#716557">Hi ${firstName}!</h1>
        <p style="line-height:1.7">You're in! Here's your exclusive offer:</p>
        <div style="background:#2a5070;border-radius:16px;padding:28px;text-align:center;margin:24px 0">
          <h2 style="color:#ffd080;margin:0 0 8px;font-size:22px">${offerTitle}</h2>
          ${offerDescription ? `<p style="color:rgba(255,255,255,.85);margin:0;font-size:15px">${offerDescription}</p>` : ''}
        </div>
        <p style="line-height:1.7">Show this email at the counter when you visit. No printing needed.</p>
        <p style="font-size:12px;color:#9e8e83;margin-top:32px">
          You received this because you signed up at <a href="${landingPageUrl}" style="color:#588aad">${landingPageUrl}</a>. 
          <a href="#" style="color:#588aad">Unsubscribe</a>
        </p>
      </div>
    `,
  })
}

export async function sendReminderEmail({
  to, firstName, restaurantName, offerTitle, landingPageUrl,
  logoUrl, address, adImageUrl,
}: {
  to: string; firstName: string; restaurantName: string
  offerTitle: string; landingPageUrl: string
  logoUrl?: string; address?: string; adImageUrl?: string
}) {
  const hero = adImageUrl || DEFAULT_HERO
  return resend.emails.send({
    from: `${restaurantName} via Queuepon <${FROM}>`,
    to,
    subject: `Don't forget — your ${offerTitle} offer is still waiting, ${firstName}`,
    html: emailWrap(`
      ${eHeader()}
      ${eBranding(restaurantName, logoUrl, address)}
      ${eHero(hero, restaurantName)}
      <tr><td style="padding:36px 32px 28px;font-family:'Helvetica Neue',Arial,sans-serif;">
        <h1 style="font-family:'Poppins','Helvetica Neue',Arial,sans-serif;font-size:24px;font-weight:700;color:#716559;margin:0 0 14px;line-height:1.3;">
          Still thinking about it, ${firstName}? 👋
        </h1>
        <p style="font-size:17px;color:#9e8e83;line-height:1.7;margin:0 0 24px;">
          Your <strong style="color:#716559;">${offerTitle}</strong> offer from
          <strong style="color:#716559;">${restaurantName}</strong> is still waiting.
          Stop in this week and show this email at the counter — no printing needed.
        </p>
        ${eOfferBox('YOUR OFFER', offerTitle)}
        ${eCTA(landingPageUrl, 'Redeem My Offer →')}
        <p style="font-size:17px;color:#716559;line-height:1.7;margin:0;">
          See you soon,<br/><strong>${restaurantName}</strong>
        </p>
      </td></tr>
      ${eFooter(landingPageUrl)}
    `),
  })
}

export async function sendAdReadyEmail({
  to, firstName, restaurantName, offerTitle, dashboardUrl,
}: {
  to: string; firstName: string; restaurantName: string
  offerTitle: string; dashboardUrl: string
}) {
  return resend.emails.send({
    from: `Queuepon <${FROM}>`,
    to,
    subject: `Your ad is ready to review, ${firstName} 🎯`,
    html: `
      <div style="font-family:'Helvetica Neue',sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fdfaf7;color:#716557">
        <img src="https://dvxmwudqmpyudfggmadm.supabase.co/storage/v1/object/public/logos/queuepon-logo-web.png" alt="Queuepon" style="height:36px;width:auto;display:block;margin-bottom:28px;" />
        <h1 style="font-size:24px;font-weight:700;color:#716557;margin:0 0 12px">Your ad is ready, ${firstName}! 🎯</h1>
        <p style="color:#9e8e83;line-height:1.7;margin:0 0 20px">
          We've built your <strong style="color:#716557">${offerTitle}</strong> campaign for 
          <strong style="color:#716557">${restaurantName}</strong>. Review it and launch when you're ready.
        </p>
        <div style="background:#e8f2f8;border-radius:12px;padding:20px 24px;margin-bottom:28px">
          <div style="font-size:13px;color:#2a5070;font-weight:700;margin-bottom:8px">What we built:</div>
          <ul style="margin:0;padding-left:20px;color:#588aad;font-size:13px;line-height:2">
            <li>Facebook + Instagram ad campaign</li>
            <li>ZIP code geo-targeting configured</li>
            <li>Your offer landing page is live</li>
            <li>Email sequence ready to fire</li>
          </ul>
        </div>
        <div style="text-align:center;margin:32px 0">
          <a href="${dashboardUrl}" style="background:#588aad;color:white;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:16px;display:inline-block">
            Preview & Launch My Ad →
          </a>
        </div>
        <p style="font-size:12px;color:#9e8e83;margin-top:24px">
          Questions? Reach us at hello@queuepon.com
        </p>
      </div>
    `,
  })
}

export async function sendComeBackOwnerSetupEmail({
  to, firstName, restaurantName, dashboardUrl,
  logoUrl, address,
}: {
  to: string; firstName: string; restaurantName: string; dashboardUrl: string
  logoUrl?: string; address?: string
}) {
  return resend.emails.send({
    from: `Queuepon <${FROM}>`,
    to,
    subject: `Next step for ${restaurantName}: set up your Come Back offer`,
    html: emailWrap(`
      ${eHeader()}
      ${eBranding(restaurantName, logoUrl, address)}
      ${eHero(DEFAULT_HERO, restaurantName)}
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
        ${eCTA(dashboardUrl, 'Set Up My Come Back Offer →')}
        <p style="font-size:17px;color:#716559;line-height:1.7;margin:0;">
          Here for you,<br/><strong>The Queuepon Team</strong>
        </p>
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
  })
}

export async function sendBringAFriendEmail({
  to, firstName, restaurantName, offerTitle, landingPageUrl,
  logoUrl, address, adImageUrl, expiryDate,
}: {
  to: string; firstName: string; restaurantName: string
  offerTitle: string; landingPageUrl: string
  logoUrl?: string; address?: string; adImageUrl?: string; expiryDate?: string
}) {
  const hero      = adImageUrl || DEFAULT_HERO
  const shareUrl  = landingPageUrl.split('?')[0]
  const expiryExtra = expiryDate
    ? `<div style="font-size:12px;color:#716559;margin-top:10px;font-weight:600;">
         Expires ${new Date(expiryDate).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}
       </div>`
    : undefined
  return resend.emails.send({
    from: `${restaurantName} via Queuepon <${FROM}>`,
    to,
    subject: `Know someone who'd love ${restaurantName}? Share your offer`,
    html: emailWrap(`
      ${eHeader()}
      ${eBranding(restaurantName, logoUrl, address)}
      ${eHero(hero, restaurantName)}
      <tr><td style="padding:36px 32px 28px;font-family:'Helvetica Neue',Arial,sans-serif;">
        <h1 style="font-family:'Poppins','Helvetica Neue',Arial,sans-serif;font-size:24px;font-weight:700;color:#716559;margin:0 0 14px;line-height:1.3;">
          Hey ${firstName} — your offer is still valid! 🎉
        </h1>
        <p style="font-size:17px;color:#9e8e83;line-height:1.7;margin:0 0 24px;">
          You claimed your <strong style="color:#716559;">${offerTitle}</strong> from
          <strong style="color:#716559;">${restaurantName}</strong>.
          Know a friend who'd love it? Share the link below and they can grab the same deal.
        </p>
        ${eOfferBox('STILL VALID', offerTitle, undefined, expiryExtra)}
        <p style="font-size:14px;color:#9e8e83;line-height:1.7;margin:0 0 20px;">
          Share this link with friends:<br/>
          <a href="${shareUrl}" style="color:#588aad;word-break:break-all;">${shareUrl}</a>
        </p>
        ${eCTA(landingPageUrl, 'View My Offer →')}
        <p style="font-size:17px;color:#716559;line-height:1.7;margin:0;">
          Cheers,<br/><strong>${restaurantName}</strong>
        </p>
      </td></tr>
      ${eFooter(landingPageUrl)}
    `),
  })
}

export async function sendComeBackCustomerEmail({
  to, firstName, restaurantName, comeBackOfferText, imageUrl, landingPageUrl,
  logoUrl, address,
}: {
  to: string; firstName: string; restaurantName: string
  comeBackOfferText: string; imageUrl?: string; landingPageUrl: string
  logoUrl?: string; address?: string
}) {
  const hero = imageUrl || DEFAULT_HERO
  return resend.emails.send({
    from: `${restaurantName} via Queuepon <${FROM}>`,
    to,
    subject: `We miss you, ${firstName} — a special offer just for you`,
    html: emailWrap(`
      ${eHeader()}
      ${eBranding(restaurantName, logoUrl, address)}
      ${eHero(hero, restaurantName)}
      <tr><td style="padding:36px 32px 28px;font-family:'Helvetica Neue',Arial,sans-serif;">
        <h1 style="font-family:'Poppins','Helvetica Neue',Arial,sans-serif;font-size:24px;font-weight:700;color:#716559;margin:0 0 14px;line-height:1.3;">
          We miss you, ${firstName}! 🥺
        </h1>
        <p style="font-size:17px;color:#9e8e83;line-height:1.7;margin:0 0 24px;">
          It's been a while since your last visit to
          <strong style="color:#716559;">${restaurantName}</strong>.
          We're holding something special just for you:
        </p>
        ${eOfferBox('WELCOME BACK OFFER', comeBackOfferText)}
        ${eCTA(landingPageUrl, 'Redeem My Offer →')}
        <p style="font-size:17px;color:#716559;line-height:1.7;margin:0;">
          Hope to see you soon,<br/><strong>${restaurantName}</strong>
        </p>
      </td></tr>
      ${eFooter(landingPageUrl)}
    `),
  })
}

const BIRTHDAY_HERO = 'https://dvxmwudqmpyudfggmadm.supabase.co/storage/v1/object/public/offer-images/default/birthday-offer.png'

export async function sendBirthdayEmail({
  to, firstName, restaurantName, birthdayOffer, landingPageUrl,
  logoUrl, address, adImageUrl,
}: {
  to: string; firstName: string; restaurantName: string
  birthdayOffer: string; landingPageUrl: string
  logoUrl?: string; address?: string; adImageUrl?: string
}) {
  const hero = adImageUrl || BIRTHDAY_HERO || DEFAULT_HERO
  return resend.emails.send({
    from: `${restaurantName} via Queuepon <${FROM}>`,
    to,
    subject: `🎂 Happy birthday, ${firstName}! A gift from ${restaurantName}`,
    html: emailWrap(`
      ${eHeader()}
      ${eBranding(restaurantName, logoUrl, address)}
      ${eHero(hero, restaurantName)}
      <tr><td style="padding:36px 32px 28px;font-family:'Helvetica Neue',Arial,sans-serif;">
        <h1 style="font-family:'Poppins','Helvetica Neue',Arial,sans-serif;font-size:24px;font-weight:700;color:#716559;margin:0 0 14px;line-height:1.3;">
          Happy birthday, ${firstName}! 🎉
        </h1>
        <p style="font-size:17px;color:#9e8e83;line-height:1.7;margin:0 0 24px;">
          Everyone at <strong style="color:#716559;">${restaurantName}</strong> is wishing you
          the very best this month. To celebrate, we've got something special just for you —
          no candles required.
        </p>
        ${eOfferBox('BIRTHDAY OFFER', birthdayOffer)}
        ${eCTA(landingPageUrl, 'Redeem Your Birthday Offer')}
        <p style="font-size:17px;color:#716559;line-height:1.7;margin:0;">
          Here's to a great one,<br/><strong>${restaurantName}</strong>
        </p>
      </td></tr>
      ${eFooter(landingPageUrl)}
    `),
  })
}

export async function sendAdLaunchedNotification({
  restaurantName, ownerName, zipCode, plan, campaignId,
}: {
  restaurantName: string; ownerName: string
  zipCode: string; plan: string; campaignId: string
}) {
  return resend.emails.send({
    from: `Queuepon System <${FROM}>`,
    to:   FROM, // notify the team
    subject: `🚀 New ad launched — ${restaurantName}`,
    html: `
      <div style="font-family:sans-serif;padding:24px;color:#333">
        <h2>New ad just launched!</h2>
        <p><strong>Restaurant:</strong> ${restaurantName}</p>
        <p><strong>Owner:</strong> ${ownerName}</p>
        <p><strong>ZIP:</strong> ${zipCode}</p>
        <p><strong>Plan:</strong> ${plan}</p>
        <p><strong>Campaign ID:</strong> ${campaignId}</p>
        <p><a href="https://business.facebook.com/adsmanager">View in Ads Manager →</a></p>
      </div>
    `,
  })
}
