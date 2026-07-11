import { Nav } from '@/components/layout/Nav'
import { Logo } from '@/components/layout/Logo'
import { FaqAccordion } from '@/components/ui/FaqAccordion'
import Link from 'next/link'

export const metadata = { title: 'FAQ — Queuepon' }

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Nav />
      <div className="flex-1 pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="mb-8">
            <Link href="/" className="text-sm text-blue hover:underline">← Back to home</Link>
          </div>
          <div className="text-center mb-12">
            <div className="eyebrow">Help Center</div>
            <h1 className="section-title text-tan">Frequently Asked Questions</h1>
          </div>
          <FaqAccordion />
          <div className="text-center mt-12">
            <p className="text-tan-light mb-4">Still have questions?</p>
            <a href="mailto:hello@queuepon.com" className="btn-primary">
              Email Us →
            </a>
          </div>
        </div>
      </div>

      <footer className="bg-tan text-white">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 flex flex-wrap justify-between gap-8">
          <div>
            <Logo variant="white" size="md" />
            <p className="text-sm text-white/55 mt-3">Done-for-you restaurant marketing.</p>
          </div>
          <div className="flex gap-10 flex-wrap">
            {[
              ['Home', '/'],
              ['Pricing', '/#pricing'],
              ['Sign Up', '/signup'],
              ['Terms', '/terms'],
              ['Privacy', '/privacy'],
            ].map(([label, href]) => (
              <a key={label} href={href} className="text-sm text-white/65 hover:text-white transition-colors">{label}</a>
            ))}
          </div>
        </div>
        <div className="border-t border-white/10 px-6 md:px-10 py-4 max-w-6xl mx-auto text-xs text-white/35">
          © 2026 Queuepon · Louisville, KY
        </div>
      </footer>
    </div>
  )
}
