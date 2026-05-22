import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL || 'hello@queuepon.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://queuepon.com'

export async function sendRestaurantWelcome({
  to, firstName, restaurantName, plan, zipCode,
}: {
  to: string; firstName: string; restaurantName: string; plan: string; zipCode: string
}) {
  const planNames: Record<string, string> = {
    grow: 'Grow', expand: 'Expand', thrive: 'Thrive'
  }

  return resend.emails.send({
    from: `Queuepon <${FROM}>`,
    to,
    subject: `You're live on Queuepon, ${firstName}! Here's how to access your dashboard.`,
    html: `
      <div style="font-family:'Helvetica Neue',sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fdfaf7;color:#716557">
        <div style="margin-bottom:28px">
          <span style="font-size:22px;font-weight:900;color:#716557;letter-spacing:-0.3px">queue<span style="color:#588aad">pon</span></span>
        </div>

        <h1 style="font-size:26px;font-weight:700;color:#716557;margin:0 0 12px">
          Welcome to Queuepon, ${firstName}! 🎉
        </h1>
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
            Use your email address: <strong>${to}</strong><br/>
            First time? <a href="${APP_URL}/login" style="color:#588aad;font-weight:600">Click here to set your password →</a>
          </p>
        </div>

        <div style="border-top:1px solid #ede5db;padding-top:20px;margin-top:8px">
          <p style="font-size:13px;color:#9e8e83;margin:0 0 4px">What happens next:</p>
          <ul style="font-size:13px;color:#716557;line-height:2;padding-left:20px;margin:8px 0">
            <li>Your Meta ad goes live within 24 hours targeting ZIP ${zipCode}</li>
            <li>Share your offer landing page to start collecting customer emails</li>
            <li>Watch subscribers and ad results in your dashboard</li>
          </ul>
        </div>

        <p style="font-size:13px;color:#9e8e83;margin-top:24px">
          Questions? Reply to this email or call us:<br/>
          Cliff Hilton: (502) 881-4235 · Joel Gerdis: (502) 489-4673
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
          <p style="color:rgba(255,255,255,.85);margin:0;font-size:15px">${offerDescription}</p>
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
  to, firstName, restaurantName, offerTitle,
}: {
  to: string; firstName: string; restaurantName: string; offerTitle: string
}) {
  return resend.emails.send({
    from: `${restaurantName} via Queuepon <${FROM}>`,
    to,
    subject: `Don't forget — your offer is waiting, ${firstName}`,
    html: `
      <div style="font-family:'Helvetica Neue',sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#716557">
        <h1>Still waiting for you, ${firstName}!</h1>
        <p style="line-height:1.7">Your <strong>${offerTitle}</strong> from ${restaurantName} is still available. Stop in this week!</p>
        <p style="font-size:12px;color:#9e8e83;margin-top:32px"><a href="#" style="color:#588aad">Unsubscribe</a></p>
      </div>
    `,
  })
}
