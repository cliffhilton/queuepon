import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.RESEND_FROM_EMAIL || 'hello@queuepon.com'

// ── Welcome email when restaurant signs up ────────────────────────────────
export async function sendRestaurantWelcome({
  to,
  firstName,
  restaurantName,
  plan,
  zipCode,
}: {
  to: string
  firstName: string
  restaurantName: string
  plan: string
  zipCode: string
}) {
  return resend.emails.send({
    from: `Queuepon <${FROM}>`,
    to,
    subject: `You're live on Queuepon, ${firstName}! Here's what happens next.`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <img src="https://queuepon.com/wp-content/uploads/2023/08/queuepon-logo-stacked-brown.png" height="48" alt="Queuepon"/>
        <h1 style="color:#716557;margin-top:24px">Welcome to Queuepon, ${firstName}!</h1>
        <p style="color:#716557;line-height:1.7">Your <strong>${restaurantName}</strong> account is live on the <strong>${plan} Plan</strong>.</p>
        <p style="color:#716557;line-height:1.7">Your Meta ad is being set up to target <strong>ZIP ${zipCode}</strong> and will go live within 24 hours.</p>
        <div style="background:#e8f2f8;border-radius:12px;padding:20px;margin:24px 0">
          <p style="margin:0;color:#2a5070;font-weight:600">Next steps:</p>
          <ol style="color:#2a5070;line-height:2;margin:8px 0 0">
            <li>Log into your dashboard at <a href="https://queuepon.com/dashboard">queuepon.com/dashboard</a></li>
            <li>Create your first offer</li>
            <li>Share your landing page link</li>
          </ol>
        </div>
        <p style="color:#9e8e83;font-size:13px">Questions? Reply to this email or call Cliff at (502) 881-4235.</p>
      </div>
    `,
  })
}

// ── Email 1: Customer claims offer ────────────────────────────────────────
export async function sendCustomerOfferEmail({
  to,
  firstName,
  restaurantName,
  offerTitle,
  offerDescription,
  landingPageUrl,
}: {
  to: string
  firstName: string
  restaurantName: string
  offerTitle: string
  offerDescription: string
  landingPageUrl: string
}) {
  return resend.emails.send({
    from: `${restaurantName} via Queuepon <${FROM}>`,
    to,
    subject: `Here's your ${offerTitle} from ${restaurantName} 🎉`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <h1 style="color:#716557">Hi ${firstName}!</h1>
        <p style="color:#716557;line-height:1.7">You're in! Here's your exclusive offer:</p>
        <div style="background:#2a5070;border-radius:16px;padding:28px;text-align:center;margin:24px 0">
          <h2 style="color:#ffd080;margin:0 0 8px;font-size:24px">${offerTitle}</h2>
          <p style="color:rgba(255,255,255,.85);margin:0">${offerDescription}</p>
        </div>
        <p style="color:#716557;line-height:1.7">Just show this email at the counter when you visit. No printing needed.</p>
        <p style="color:#9e8e83;font-size:12px;margin-top:32px">
          You're receiving this because you signed up at <a href="${landingPageUrl}">${landingPageUrl}</a>. 
          <a href="#">Unsubscribe</a>
        </p>
        <img src="https://queuepon.com/wp-content/uploads/2023/08/queuepon-logo-stacked-brown.png" height="32" alt="Queuepon" style="margin-top:16px;opacity:.5"/>
      </div>
    `,
  })
}

// ── Email 2: Day 3 reminder ────────────────────────────────────────────────
export async function sendReminderEmail({
  to,
  firstName,
  restaurantName,
  offerTitle,
}: {
  to: string
  firstName: string
  restaurantName: string
  offerTitle: string
}) {
  return resend.emails.send({
    from: `${restaurantName} via Queuepon <${FROM}>`,
    to,
    subject: `Don't forget — your offer is waiting, ${firstName}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <h1 style="color:#716557">Still waiting for you, ${firstName}!</h1>
        <p style="color:#716557;line-height:1.7">Your <strong>${offerTitle}</strong> from ${restaurantName} is still available. Stop in this week!</p>
        <p style="color:#9e8e83;font-size:12px;margin-top:32px"><a href="#">Unsubscribe</a></p>
      </div>
    `,
  })
}
