'use client'

import { useState } from 'react'

interface Props {
  restaurantId: string
  birthdayOffer: string
}

export function BirthdayOfferSection({ restaurantId, birthdayOffer: initial }: Props) {
  const [open,   setOpen]   = useState(false)
  const [value,  setValue]  = useState(initial)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await fetch('/api/restaurant/birthday-offer', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ restaurantId, birthdayOffer: value }),
      })
    } finally {
      setSaving(false)
      setOpen(false)
    }
  }

  return (
    <div className="border-t border-cream-dark mt-4 pt-4">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-sm text-tan-light hover:text-tan transition-colors w-full text-left">
        <span>🎂</span>
        <span className="font-medium">Birthday Offer</span>
        {!open && (
          <span className="ml-auto text-blue text-xs font-semibold">
            {value ? 'Edit →' : 'Set up →'}
          </span>
        )}
      </button>
      {!open && value && (
        <p className="text-xs text-tan-light mt-1 truncate">{value}</p>
      )}
      {open && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-tan-light">
            We'll automatically email customers in their birthday month on the 1st. Leave blank to skip.
          </p>
          <input
            className="form-input text-sm"
            placeholder="e.g. Free dessert on your birthday — show this email at the counter!"
            value={value}
            onChange={e => setValue(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="btn-primary btn-sm text-xs">
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setOpen(false)} className="btn-ghost btn-sm text-xs">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
