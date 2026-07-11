'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Step { num: number; title: string; sub: string }
type Phase = 'idle' | 'out-l' | 'out-r' | 'in-l' | 'in-r'
interface Props { steps: Step[] }

const VISUALS = [
  { bg: 'from-blue-deeper to-blue',        emoji: '🎯' },
  { bg: 'from-blue to-blue-light',          emoji: '🚀' },
  { bg: 'from-blue-deeper to-blue-light',   emoji: '📧' },
  { bg: 'from-tan to-blue-deeper',          emoji: '📈' },
]

export function BottomStepBar({ steps }: Props) {
  const [visible,  setVisible]  = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [current,  setCurrent]  = useState(0)
  const [phase,    setPhase]    = useState<Phase>('idle')

  useEffect(() => {
    if (!sessionStorage.getItem('queuepon_bar_dismissed')) setVisible(true)
  }, [])

  const dismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    sessionStorage.setItem('queuepon_bar_dismissed', '1')
    setVisible(false)
    setExpanded(false)
  }

  const goTo = (next: number) => {
    const dir = next > current ? 'left' : 'right'
    setPhase(dir === 'left' ? 'out-l' : 'out-r')
    setTimeout(() => {
      setCurrent(next)
      setPhase(dir === 'left' ? 'in-r' : 'in-l')
      requestAnimationFrame(() => requestAnimationFrame(() => setPhase('idle')))
    }, 160)
  }

  if (!visible) return null

  const step   = steps[current]
  const isLast = current === steps.length - 1
  const visual = VISUALS[current] ?? VISUALS[0]

  const slideClass =
    phase === 'out-l' ? '-translate-x-6 opacity-0' :
    phase === 'out-r' ? 'translate-x-6 opacity-0'  :
    phase === 'in-l'  ? '-translate-x-6 opacity-0' :
    phase === 'in-r'  ? 'translate-x-6 opacity-0'  :
    'translate-x-0 opacity-100'

  return (
    <>
      {expanded && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setExpanded(false)} />
      )}
      <div
        className="fixed bottom-0 left-0 right-0 md:right-auto md:left-6 md:w-[390px] z-50 bg-white rounded-t-3xl transition-transform duration-300 ease-out h-[75vh]"
        style={{
          transform: expanded ? 'translateY(0)' : 'translateY(calc(100% - 3.5rem))',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.10), 0 -1px 6px rgba(0,0,0,0.06), 8px 0 32px rgba(0,0,0,0.08)',
        }}
      >
        <div
          className="h-14 flex items-center justify-between px-5 cursor-pointer select-none"
          onClick={() => setExpanded(prev => !prev)}
        >
          <div className="flex items-center gap-2 text-base font-semibold text-blue">
            <span className="w-5 h-5 rounded-full bg-blue text-white text-xs flex items-center justify-center font-bold leading-none">i</span>
            How it works
          </div>
          <button onClick={dismiss} className="w-8 h-8 flex items-center justify-center text-tan-light hover:text-tan transition-colors" aria-label="Dismiss">
            ✕
          </button>
        </div>
        <div className="flex flex-col h-[calc(75vh-3.5rem)] overflow-hidden">
          <div className={`flex flex-col flex-1 transition-all duration-150 overflow-hidden ${slideClass}`}>
            <div className={`flex-shrink-0 h-44 bg-gradient-to-br ${visual.bg} flex items-center justify-center`}>
              <span className="text-8xl">{visual.emoji}</span>
            </div>
            <div className="flex-1 px-6 pt-6 overflow-y-auto">
              <div className="text-xs text-tan-light uppercase tracking-widest mb-2">
                Step {step.num} of {steps.length}
              </div>
              <h2 className="text-2xl font-bold text-tan mb-3 leading-tight">{step.title}</h2>
              <p className="text-tan-light leading-relaxed">{step.sub}</p>
            </div>
          </div>
          <div className="flex-shrink-0 px-6 pb-8 pt-4">
            <div className="flex justify-center items-center gap-2 mb-5">
              {steps.map((_, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className={`rounded-full transition-all duration-200 ${
                    i === current ? 'w-6 h-2 bg-blue' : 'w-2 h-2 bg-tan-light/30 hover:bg-tan-light/60'
                  }`} />
              ))}
            </div>
            {isLast ? (
              <Link href="/signup" className="btn-primary w-full py-4 text-base text-center block">Get Started →</Link>
            ) : (
              <button onClick={() => goTo(current + 1)} className="btn-primary w-full py-4 text-base">Next →</button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
