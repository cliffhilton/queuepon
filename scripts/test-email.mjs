#!/usr/bin/env node
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// Load .env.local
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../.env.local')
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
}

const { Resend } = await import('resend')
const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL || 'hello@queuepon.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://queuepon.com'

const firstName      = 'Cliff'
const restaurantName = 'Testsushi Restaurant'
const plan           = 'expand'
const zipCode        = '40202'
const setupUrl       = 'https://queuepon.com/set-password?test=true'
const to             = 'cliff+test45@cratelouisville.com'

const planNames = { grow: 'Grow', expand: 'Expand', thrive: 'Thrive' }

const { data, error } = await resend.emails.send({
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

if (error) {
  console.error('❌ Send failed:', error)
  process.exit(1)
}

console.log('✅ Email sent! ID:', data.id)
console.log('   To:', to)
