'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from './Logo'

export function Nav() {
  const [open, setOpen] = useState(false)

  const links = [
    { href: '/#how-it-works', label: 'How It Works' },
    { href: '/#pricing',      label: 'Pricing' },
    { href: '/investor',      label: 'Investor Deck' },
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-cream-dark flex items-center justify-between px-6 md:px-10 shadow-sm">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <Logo variant="dark" size="md" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-2">
          {links.map(l => (
            <Link key={l.href} href={l.href}
<<<<<<< HEAD
              className="text-sm font-medium text-tan-light hover:text-blue-DEFAULT hover:bg-blue-xpale px-3 py-2 rounded-lg transition-all">
=======
              className="text-sm font-medium text-tan-light hover:text-blue hover:bg-blue-xpale px-3 py-2 rounded-lg transition-all">
>>>>>>> e9bcba0 (Initial commit — full Queuepon build)
              {l.label}
            </Link>
          ))}
          <Link href="/login"
<<<<<<< HEAD
            className="text-sm font-medium text-tan-light hover:text-blue-DEFAULT px-3 py-2 rounded-lg transition-all ml-1">
=======
            className="text-sm font-medium text-tan-light hover:text-blue px-3 py-2 rounded-lg transition-all ml-1">
>>>>>>> e9bcba0 (Initial commit — full Queuepon build)
            Log In
          </Link>
          <Link href="/signup"
            className="btn-primary text-sm ml-2">
            Claim Your Spot
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setOpen(!open)}
          aria-label="Menu">
<<<<<<< HEAD
          <span className={`block w-6 h-0.5 bg-tan-DEFAULT transition-all duration-300 ${open ? 'translate-y-2 rotate-45' : ''}`}/>
          <span className={`block w-6 h-0.5 bg-tan-DEFAULT transition-all duration-300 ${open ? 'opacity-0' : ''}`}/>
          <span className={`block w-6 h-0.5 bg-tan-DEFAULT transition-all duration-300 ${open ? '-translate-y-2 -rotate-45' : ''}`}/>
=======
          <span className={`block w-6 h-0.5 bg-tan transition-all duration-300 ${open ? 'translate-y-2 rotate-45' : ''}`}/>
          <span className={`block w-6 h-0.5 bg-tan transition-all duration-300 ${open ? 'opacity-0' : ''}`}/>
          <span className={`block w-6 h-0.5 bg-tan transition-all duration-300 ${open ? '-translate-y-2 -rotate-45' : ''}`}/>
>>>>>>> e9bcba0 (Initial commit — full Queuepon build)
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed top-16 left-0 right-0 bottom-0 bg-white z-40 flex flex-col p-6 gap-2 border-t border-cream-dark md:hidden">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              onClick={() => setOpen(false)}
<<<<<<< HEAD
              className="text-base font-semibold text-tan-DEFAULT hover:bg-blue-xpale hover:text-blue-DEFAULT px-4 py-3 rounded-xl transition-all">
=======
              className="text-base font-semibold text-tan hover:bg-blue-xpale hover:text-blue px-4 py-3 rounded-xl transition-all">
>>>>>>> e9bcba0 (Initial commit — full Queuepon build)
              {l.label}
            </Link>
          ))}
          <div className="h-px bg-cream-dark my-2"/>
          <Link href="/login" onClick={() => setOpen(false)}
            className="text-base font-semibold text-tan-light px-4 py-3 rounded-xl hover:bg-cream-dark transition-all">
            Log In
          </Link>
          <Link href="/signup" onClick={() => setOpen(false)}
            className="btn-primary text-center mt-2">
            Claim Your Spot →
          </Link>
          <div className="mt-auto pt-6 text-center">
            <p className="text-xs text-tan-light">Cliff Hilton: (502) 881-4235</p>
            <p className="text-xs text-tan-light">Joel Gerdis: (502) 489-4673</p>
          </div>
        </div>
      )}
    </>
  )
}
