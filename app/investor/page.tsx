import { Nav } from '@/components/layout/Nav'
import Link from 'next/link'

export default function InvestorPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Nav />
      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          {/* Hero */}
          <div className="bg-gradient-to-br from-blue-deeper to-blue rounded-2xl p-12 text-center text-white mb-12">
            <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-4">Friends & Family Investment Round · 2026</div>
            <h1 className="text-4xl font-bold text-white mb-4">Turning Ads into <span className="text-yellow-200">Customers</span><br/>for Local Businesses</h1>
            <p className="text-white/80 text-lg max-w-xl mx-auto leading-relaxed">The model works. The pilots are running. We need a partner to scale it.</p>
          </div>
          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[['1M+','Independent restaurants in the US'],['+ 23%','Avg. new customers'],['15%','Gross profit boost in 90 days'],['$28B','US restaurant marketing spend/yr']].map(([num,label]) => (
              <div key={label} className="card text-center">
                <div className="text-3xl font-bold text-blue mb-2">{num}</div>
                <div className="text-xs text-tan-light leading-relaxed">{label}</div>
              </div>
            ))}
          </div>
          {/* Ask */}
          <div id="terms" className="card mb-8">
            <h2 className="text-2xl font-bold text-tan mb-6">The Ask · $10,000–$25,000</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon:'📈', name:'Equity Option', detail:'Own a piece of Queuepon as it grows.', highlight:'2% equity for $10,000' },
                { icon:'💰', name:'Revenue Share', detail:'Receive a return paid from revenue over a fixed period.', highlight:'1.2× return over 12–18 months' },
                { icon:'🔄', name:'Convertible Note', detail:'Starts as a loan, converts to equity at next round.', highlight:'Converts at next funding round' },
              ].map(t => (
                <div key={t.name} className="bg-cream-dark/50 rounded-xl p-6 border border-cream-dark">
                  <div className="text-2xl mb-3">{t.icon}</div>
                  <div className="font-bold text-tan mb-2">{t.name}</div>
                  <div className="text-sm text-tan-light mb-4 leading-relaxed">{t.detail}</div>
                  <div className="bg-blue-pale rounded-lg px-3 py-2">
                    <div className="text-xs font-bold text-blue-dark uppercase tracking-wider">Example</div>
                    <div className="text-sm font-bold text-blue-deeper mt-1">{t.highlight}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center">
            <a href="mailto:hello@queuepon.com?subject=Queuepon Investment Inquiry" className="btn-primary text-base px-10 py-4">
              Request Full Deck →
            </a>
            <div className="mt-4 text-sm text-tan-light">
              <a href="mailto:hello@queuepon.com" className="text-blue hover:underline">hello@queuepon.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
