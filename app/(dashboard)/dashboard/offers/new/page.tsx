'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface FormData {
  title: string
  description: string
  offerType: string
  expiryDate: string
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-red-500 text-xs font-semibold mt-1.5">⚠ {msg}</p>
}

export default function NewOfferPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({
    title: '', description: '', offerType: 'free_item', expiryDate: '',
  })
  const [errors,  setErrors]  = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [saving,  setSaving]  = useState(false)

  const set = (field: keyof FormData, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const blur = (field: string) => setTouched(t => ({ ...t, [field]: true }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim())       e.title       = 'Offer headline is required'
    if (!form.description.trim()) e.description = 'Offer description is required'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    setErrors(e)
    setTouched({ title: true, description: true })
    if (Object.keys(e).length > 0) return

    setSaving(true)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      // Get restaurant
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      if (!restaurant) throw new Error('Restaurant not found')

      // Create slug
      const slug = `${form.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}-${Date.now()}`

      // Insert offer
      const { error } = await supabase
        .from('offers')
        .insert({
          restaurant_id: restaurant.id,
          title:         form.title,
          description:   form.description,
          offer_type:    form.offerType,
          slug,
          status:        'live',
          expiry_date:   form.expiryDate || null,
        })

      if (error) throw error

      router.push('/dashboard/offers')
      router.refresh()

    } catch (err: any) {
      setErrors({ title: err.message || 'Something went wrong' })
      setSaving(false)
    }
  }

  const slug = form.title.toLowerCase().replace(/\s+/g, '-') || 'your-offer'

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/offers" className="text-tan-light hover:text-blue transition-colors">
          ← Back
        </Link>
        <div className="w-px h-4 bg-cream-dark"/>
        <div>
          <h1 className="text-2xl font-bold text-tan">New Offer</h1>
          <p className="text-tan-light text-sm mt-0.5">Creates a live landing page instantly.</p>
        </div>
      </div>

      <div className="card mb-5">
        <div className="form-group">
          <label className="form-label">Offer Headline</label>
          <input className={`form-input ${touched.title && errors.title ? 'border-red-400' : ''}`}
            placeholder="Free Dessert Every Friday"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            onBlur={() => blur('title')}/>
          <FieldError msg={touched.title ? errors.title : undefined}/>
          <p className="text-xs text-tan-light mt-1">This appears on your landing page and in emails.</p>
        </div>

        <div className="form-group">
          <label className="form-label">Offer Description</label>
          <textarea
            className={`form-input min-h-[80px] resize-none ${touched.description && errors.description ? 'border-red-400' : ''}`}
            placeholder="Get a free churro with any entrée, every Friday. Just show this email at the counter."
            value={form.description}
            onChange={e => set('description', e.target.value)}
            onBlur={() => blur('description')}/>
          <FieldError msg={touched.description ? errors.description : undefined}/>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Offer Type</label>
            <select className="form-input" value={form.offerType} onChange={e => set('offerType', e.target.value)}>
              <option value="free_item">Free Item</option>
              <option value="percent_off">% Discount</option>
              <option value="dollar_off">$ Off</option>
              <option value="bogo">BOGO</option>
              <option value="happy_hour">Happy Hour</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Expiry Date</label>
            <input className="form-input" type="date"
              value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)}/>
          </div>
        </div>

        {/* Live preview */}
        <div className="mt-2 rounded-xl overflow-hidden border border-blue-pale">
          <div className="bg-blue-deeper px-4 py-2 text-xs text-white/60 font-medium">
            Landing Page Preview — queuepon.com/offers/{slug}
          </div>
          <div className="bg-gradient-to-br from-blue-deeper to-blue p-6 text-center text-white">
            <div className="text-xl font-bold text-yellow-200 mb-1">{form.title || 'Your Offer Headline'}</div>
            <div className="text-xs opacity-75 mb-4">{form.description || 'Your offer description appears here'}</div>
            <div className="flex gap-2 max-w-xs mx-auto">
              <input readOnly className="flex-1 rounded-lg px-3 py-2 text-xs text-tan bg-white" placeholder="Email address"/>
              <button className="bg-yellow-300 text-tan-dark text-xs font-bold px-3 py-2 rounded-lg">Claim →</button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Link href="/dashboard/offers" className="btn-ghost">Cancel</Link>
        <button onClick={handleSave} disabled={saving}
          className={`btn-primary px-8 ${saving ? 'opacity-75 cursor-wait' : ''}`}>
          {saving ? '⏳ Creating...' : '🚀 Create Offer & Go Live →'}
        </button>
      </div>
    </div>
  )
}
