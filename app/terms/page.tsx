import { Nav } from '@/components/layout/Nav'

export const metadata = { title: 'Terms of Service — Queuepon' }

export default function TermsPage() {
  const sections = [
    { title: '1. Acceptance of Terms', body: "By using Queuepon's services, you agree to these Terms of Service. If you do not agree, please do not use our services." },
    { title: '2. Description of Service', body: "Queuepon provides a done-for-you restaurant marketing platform that creates and manages Facebook and Instagram ad campaigns, landing pages, and automated email sequences on behalf of restaurant clients." },
    { title: '3. Subscription and Billing', body: 'Plans are billed monthly: Grow ($199/mo), Expand ($499/mo), Thrive ($799/mo). You may cancel anytime; cancellation takes effect at the end of the billing period. We do not provide partial-month refunds.' },
    { title: '4. Ad Campaigns and Content', body: "By uploading images and offer details, you grant Queuepon a license to use this content for advertising on your behalf. You confirm you own or have rights to all content provided. Queuepon may decline campaigns that violate Meta's policies." },
    { title: '5. Ad Spend', body: 'Ad spend included in your subscription is managed by Queuepon. Unused spend does not roll over. Queuepon allocates spend at our discretion to maximize performance.' },
    { title: '6. Prohibited Uses', body: 'You may not use Queuepon to advertise illegal products, make false claims, violate applicable laws, or infringe on intellectual property rights.' },
    { title: '7. Limitation of Liability', body: "Queuepon's liability is limited to amounts paid in the three months preceding any claim. We are not liable for indirect, incidental, or consequential damages." },
    { title: '8. Termination', body: 'We may terminate or suspend accounts at any time for terms violations. Active campaigns will be paused upon termination.' },
    { title: '9. Governing Law', body: 'These terms are governed by the laws of the State of Kentucky. Disputes shall be resolved in Jefferson County, Kentucky.' },
    { title: '10. Contact', body: 'Questions? Email hello@queuepon.com.' },
  ]
  return (
    <div className="min-h-screen bg-cream">
      <Nav/>
      <div className="max-w-3xl mx-auto px-6 py-24">
        <h1 className="text-3xl font-bold text-tan mb-2">Terms of Service</h1>
        <p className="text-tan-light mb-10">Last updated: June 11, 2026</p>
        {sections.map(s => (
          <div key={s.title} className="mb-8">
            <h2 className="text-lg font-bold text-tan mb-3">{s.title}</h2>
            <p className="text-tan-light leading-relaxed">{s.body}</p>
          </div>
        ))}
        <div className="border-t border-cream-dark pt-8 mt-8">
          <p className="text-sm text-tan-light">Queuepon LLC · Louisville, KY · <a href="mailto:hello@queuepon.com" className="text-blue hover:underline">hello@queuepon.com</a></p>
        </div>
      </div>
    </div>
  )
}
