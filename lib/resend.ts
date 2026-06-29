import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL || 'hello@queuepon.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://queuepon.com'

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
        <div style="margin-bottom:28px">
          <span style="font-size:22px;font-weight:900;color:#716557">queue<span style="color:#588aad">pon</span></span>
        </div>
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
        <div style="margin-bottom:28px">
          <span style="font-size:22px;font-weight:900;color:#716557">queue<span style="color:#588aad">pon</span></span>
        </div>
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
        <div style="margin-bottom:28px">
          <span style="font-size:22px;font-weight:900;color:#716557">queue<span style="color:#588aad">pon</span></span>
        </div>
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
        <div style="margin-bottom:28px"><span style="font-size:22px;font-weight:900;color:#716557">queue<span style="color:#588aad">pon</span></span></div>
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
