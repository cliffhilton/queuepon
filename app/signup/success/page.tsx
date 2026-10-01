import { Suspense } from 'react'
import { SuccessContent } from './SuccessContent'
import { Nav } from '@/components/layout/Nav'

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Nav />
      <div className="pt-24 pb-20 flex items-center justify-center px-4">
        <Suspense fallback={
          <div className="text-center">
            <div className="text-3xl mb-3 animate-pulse">⚙️</div>
            <p className="text-tan-light text-sm">Loading…</p>
          </div>
        }>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  )
}
