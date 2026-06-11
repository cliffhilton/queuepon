import Link from 'next/link'
import { Nav } from '@/components/layout/Nav'

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Nav/>
      <div className="pt-24 pb-20 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="text-6xl mb-5">🎉</div>
          <h1 className="text-3xl font-bold text-tan mb-3">You're live!</h1>
          <p className="text-tan-light leading-relaxed mb-8">
            Your account is active and your Meta ad is being set up. 
            You'll receive a welcome email shortly with next steps.
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              ['📣','Meta Ad','Live in 24hrs'],
              ['📧','Emails','Sequence ready'],
              ['📊','Dashboard','Tracking live'],
            ].map(([icon,title,sub]) => (
              <div key={title} className="card text-center py-5">
                <div className="text-2xl mb-2">{icon}</div>
                <div className="text-xs font-bold text-tan">{title}</div>
                <div className="text-xs text-tan-light mt-1">{sub}</div>
              </div>
            ))}
          </div>
          <div className="card bg-blue-xpale border-blue-pale mb-6 text-left">
            <div className="font-bold text-blue-dark mb-1">📧 Check your email</div>
            <div className="text-sm text-tan-light leading-relaxed">
              We sent two emails to get you started — a welcome email and a link to set your password. 
              Check your inbox then come back to log in.
            </div>
          </div>
          <Link href="/login" className="btn-primary px-10 py-4 text-base">
            Go to Login →
          </Link>
        </div>
      </div>
    </div>
  )
}
