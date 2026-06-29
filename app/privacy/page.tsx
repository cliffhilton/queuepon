import { Nav } from '@/components/layout/Nav'

export const metadata = { title: 'Privacy Policy — Queuepon' }

export default function PrivacyPage() {
  const sections = [
    { title: '1. Information We Collect', body: 'We collect information you provide when creating an account including your name, email, phone number, restaurant name, and billing information. We also collect customer information (name and email) when they claim offers through your landing pages.' },
    { title: '2. How We Use Your Information', body: 'We use collected information to provide and improve our services, process transactions, create and manage Facebook and Instagram advertising campaigns on your behalf, and send relevant communications.' },
    { title: '3. Meta / Facebook Advertising', body: "Queuepon integrates with Meta's Marketing API to create and manage ad campaigns on behalf of restaurant clients. By using our service, you authorize Queuepon to create and manage ad campaigns using your restaurant's information and creative assets." },
    { title: '4. Information Sharing', body: 'We do not sell your personal information. We share data only with service providers necessary to operate our platform: Stripe (payments), Supabase (database), Resend (email), and Meta (advertising). All providers are contractually bound to confidentiality.' },
    { title: '5. Customer Data', body: "Customer emails and names collected through your offer landing pages are stored securely and used only to send offer communications on your behalf. You own this data. We do not use your customers' information for any other purpose." },
    { title: '6. Data Security', body: 'We implement appropriate technical and organizational measures to protect your information. All data is encrypted in transit and at rest. Payment information is handled exclusively by Stripe.' },
    { title: '7. Data Retention', body: 'We retain your information while your account is active. Upon cancellation, personal information is deleted within 30 days except where required by law.' },
    { title: '8. Your Rights', body: 'You have the right to access, correct, or delete your personal information at any time. Contact us at hello@queuepon.com to exercise these rights.' },
    { title: '9. Cookies', body: 'We use cookies to track platform activity and maintain sessions. You can instruct your browser to refuse cookies, though this may affect functionality.' },
    { title: '10. Changes to This Policy', body: 'We may update this policy periodically. We will notify you of changes by posting the new policy and updating the date above.' },
    { title: '11. Contact Us', body: 'Questions? Contact us at hello@queuepon.com.' },
  ]
  return (
    <div className="min-h-screen bg-cream">
      <Nav/>
      <div className="max-w-3xl mx-auto px-6 py-24">
        <h1 className="text-3xl font-bold text-tan mb-2">Privacy Policy</h1>
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
