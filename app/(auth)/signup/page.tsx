'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/layout/Logo'
import { Step5Payment } from '@/components/ui/Step5Payment'

type Plan = 'grow' | 'expand' | 'thrive'
type Step = 1 | 2 | 3 | 4 | 5

interface FormData {
  plan: Plan
  firstName: string; lastName: string; restaurantName: string
  email: string; phone: string; zipCode: string
  address: string; restaurantType: string
  offerTitle: string; offerDescription: string
  offerType: string; expiryDate: string
  adHeadline: string; adSubheadline: string
  adTemplate: 'full_bleed' | 'split'
  adColor: string
  adImage: File | null; adImagePreview: string
}

const PLANS = {
  grow:   { name:'Grow',   price:199, adSpend:'$50/mo',  tag:'Single location · Just starting out',  features:['3 active offers','4-email sequence','Zip targeting','Dashboard'] },
  expand: { name:'Expand', price:499, adSpend:'$150/mo', tag:'Growing restaurants ready to amplify',  features:['10 active offers','8-email + SMS','Referral campaigns','Full analytics'], popular:true },
  thrive: { name:'Thrive', price:799, adSpend:'$350/mo', tag:'Multi-location · Franchises',           features:['Unlimited offers','Multi-location','White-label pages','Strategy calls'] },
}

const RESTAURANT_TYPES = ['Quick Service (Fast Food)','Fast Casual','Pizza','Casual Dining','Food Truck','Bakery / Café','Bar & Grill','Other']
const STEPS = [{num:1,label:'Plan'},{num:2,label:'Restaurant'},{num:3,label:'Your Offer'},{num:4,label:'Ad Creative'},{num:5,label:'Payment'}]

// ── Validation error component ─────────────────────────────────────────────
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1">⚠ {msg}</p>
}

// ── Step bar ───────────────────────────────────────────────────────────────
function StepBar({ current }: { current: Step }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((s, i) => (
        <div key={s.num} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
              ${current > s.num ? 'bg-green-500 text-white' :
                current === s.num ? 'bg-blue text-white shadow-lg ring-4 ring-blue/20' :
                'bg-cream-dark text-tan-light'}`}>
              {current > s.num ? '✓' : s.num}
            </div>
            <span className={`text-xs font-semibold uppercase tracking-wide whitespace-nowrap
              ${current === s.num ? 'text-blue' : current > s.num ? 'text-green-600' : 'text-tan-light'}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-12 md:w-16 h-0.5 mb-5 mx-1 transition-all ${current > s.num ? 'bg-green-500' : 'bg-cream-dark'}`}/>
          )}
        </div>
      ))}
    </div>
  )
}

// ── STEP 1 ─────────────────────────────────────────────────────────────────
function Step1({ form, set, next }: { form: FormData; set: (f: keyof FormData, v: any) => void; next: () => void }) {
  return (
    <div>
      <div className="text-center mb-10">
        <div className="eyebrow">Step 1 of 5</div>
        <h2 className="text-2xl font-bold text-tan mt-1">Choose Your Plan</h2>
        <p className="text-tan-light mt-2 text-sm">Meta ad spend is included in every plan — targeted to your zip code.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {(Object.entries(PLANS) as [Plan, typeof PLANS.grow][]).map(([key, plan]) => (
          <div key={key} onClick={() => set('plan', key)}
            className={`relative bg-white rounded-2xl p-7 border-2 cursor-pointer transition-all hover:-translate-y-1
              ${form.plan === key ? 'border-blue shadow-card' : 'border-cream-dark hover:border-blue/40'}`}>
            {'popular' in plan && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">Most Popular</div>
            )}
            <div className="font-bold text-tan text-lg mb-1">{plan.name}</div>
            <div className="text-xs text-tan-light mb-4">{plan.tag}</div>
            <div className="text-3xl font-bold text-blue mb-1">${plan.price}<span className="text-sm text-tan-light font-normal">/mo</span></div>
            <div className="bg-blue-pale rounded-xl p-3 my-4">
              <div className="text-xs font-bold text-blue-dark uppercase tracking-wider">📣 Meta Ads Included</div>
              <div className="text-sm font-bold text-blue-deeper mt-1">{plan.adSpend} ad spend</div>
            </div>
            <ul className="space-y-2">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-tan"><span className="text-blue font-bold">✓</span>{f}</li>
              ))}
            </ul>
            <div className={`mt-5 w-full py-2.5 rounded-xl text-center text-sm font-bold transition-all
              ${form.plan === key ? 'bg-blue text-white' : 'bg-cream-dark text-tan-light'}`}>
              {form.plan === key ? 'Selected ✓' : `Select ${plan.name}`}
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-8">
        <button onClick={next} className="btn-primary px-12 py-4 text-base">
          Continue with {PLANS[form.plan].name} Plan →
        </button>
        <p className="text-xs text-tan-light mt-3">No contracts · Cancel anytime · 30-day guarantee</p>
      </div>
    </div>
  )
}

// ── STEP 2 ─────────────────────────────────────────────────────────────────
function Step2({ form, set, next, back }: { form: FormData; set: (f: keyof FormData, v: any) => void; next: () => void; back: () => void }) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.firstName.trim())     e.firstName     = 'First name is required'
    if (!form.lastName.trim())      e.lastName      = 'Last name is required'
    if (!form.restaurantName.trim()) e.restaurantName = 'Restaurant name is required'
    if (!form.email.trim())         e.email         = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address'
    if (!form.phone.trim())         e.phone         = 'Phone number is required'
    if (!form.zipCode.trim())       e.zipCode       = 'ZIP code is required'
    else if (!/^\d{5}$/.test(form.zipCode)) e.zipCode = 'Enter a valid 5-digit ZIP code'
    if (!form.restaurantType)       e.restaurantType = 'Please select a restaurant type'
    if (!form.address.trim())       e.address       = 'Street address is required'
    return e
  }

  const handleNext = () => {
    const e = validate()
    setErrors(e)
    // Mark all fields touched so errors show
    setTouched({ firstName:true, lastName:true, restaurantName:true, email:true, phone:true, zipCode:true, restaurantType:true, address:true })
    if (Object.keys(e).length === 0) next()
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const blur = (field: string) => setTouched(t => ({ ...t, [field]: true }))
  const err = (field: string) => touched[field] ? errors[field] : undefined

  const inputClass = (field: string) =>
    `form-input ${touched[field] && errors[field] ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="eyebrow">Step 2 of 5</div>
        <h2 className="text-2xl font-bold text-tan mt-1">Your Restaurant</h2>
        <p className="text-tan-light mt-2 text-sm">This powers your landing pages and Meta ad targeting.</p>
      </div>
      <div className="card">
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input className={inputClass('firstName')} placeholder="Maria"
              value={form.firstName} onChange={e => set('firstName', e.target.value)} onBlur={() => blur('firstName')}/>
            <FieldError msg={err('firstName')}/>
          </div>
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input className={inputClass('lastName')} placeholder="Lopez"
              value={form.lastName} onChange={e => set('lastName', e.target.value)} onBlur={() => blur('lastName')}/>
            <FieldError msg={err('lastName')}/>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Restaurant Name</label>
          <input className={inputClass('restaurantName')} placeholder="Fat Jimmy's Pizza"
            value={form.restaurantName} onChange={e => set('restaurantName', e.target.value)} onBlur={() => blur('restaurantName')}/>
          <FieldError msg={err('restaurantName')}/>
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className={inputClass('email')} type="email" placeholder="hello@yourrestaurant.com"
            value={form.email} onChange={e => set('email', e.target.value)} onBlur={() => blur('email')}/>
          <FieldError msg={err('email')}/>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className={inputClass('phone')} type="tel" placeholder="(502) 555-0198"
              value={form.phone} onChange={e => set('phone', e.target.value)} onBlur={() => blur('phone')}/>
            <FieldError msg={err('phone')}/>
          </div>
          <div className="form-group">
            <label className="form-label">ZIP Code <span className="text-blue normal-case font-normal">★ ad targeting</span></label>
            <input className={inputClass('zipCode')} placeholder="40202" maxLength={5}
              value={form.zipCode} onChange={e => set('zipCode', e.target.value)} onBlur={() => blur('zipCode')}/>
            <FieldError msg={err('zipCode')}/>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Restaurant Type</label>
          <select className={inputClass('restaurantType')} value={form.restaurantType}
            onChange={e => set('restaurantType', e.target.value)} onBlur={() => blur('restaurantType')}>
            <option value="">Select type...</option>
            {RESTAURANT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <FieldError msg={err('restaurantType')}/>
        </div>
        <div className="form-group mb-0">
          <label className="form-label">Street Address</label>
          <input className={inputClass('address')} placeholder="123 Main St, Louisville, KY 40202"
            value={form.address} onChange={e => set('address', e.target.value)} onBlur={() => blur('address')}/>
          <FieldError msg={err('address')}/>
        </div>
      </div>
      <div className="flex justify-between mt-6">
        <button onClick={back} className="btn-ghost">← Back</button>
        <button onClick={handleNext} className="btn-primary">Continue →</button>
      </div>
    </div>
  )
}

// ── STEP 3 ─────────────────────────────────────────────────────────────────
function Step3({ form, set, next, back }: { form: FormData; set: (f: keyof FormData, v: any) => void; next: () => void; back: () => void }) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.offerTitle.trim())       e.offerTitle       = 'Offer headline is required'
    if (!form.offerDescription.trim()) e.offerDescription = 'Offer description is required'
    return e
  }

  const handleNext = () => {
    const e = validate()
    setErrors(e)
    setTouched({ offerTitle:true, offerDescription:true })
    if (Object.keys(e).length === 0) next()
  }

  const blur = (field: string) => setTouched(t => ({ ...t, [field]: true }))
  const err  = (field: string) => touched[field] ? errors[field] : undefined
  const inputClass = (field: string) =>
    `form-input ${touched[field] && errors[field] ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`

  const slug = form.offerTitle.toLowerCase().replace(/\s+/g, '-') || 'your-offer'

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="eyebrow">Step 3 of 5</div>
        <h2 className="text-2xl font-bold text-tan mt-1">Your First Offer</h2>
        <p className="text-tan-light mt-2 text-sm">This becomes your landing page and drives your first campaign.</p>
      </div>
      <div className="card">
        <div className="form-group">
          <label className="form-label">Offer Headline</label>
          <input className={inputClass('offerTitle')} placeholder="Free Dessert Every Friday"
            value={form.offerTitle}
            onChange={e => { set('offerTitle', e.target.value); if (!form.adHeadline) set('adHeadline', e.target.value) }}
            onBlur={() => blur('offerTitle')}/>
          <FieldError msg={err('offerTitle')}/>
          <p className="text-xs text-tan-light mt-1">Appears on your landing page and in emails.</p>
        </div>
        <div className="form-group">
          <label className="form-label">Offer Description</label>
          <textarea className={`${inputClass('offerDescription')} min-h-[80px] resize-none`}
            placeholder="Get a free churro with any entrée, every Friday. Show this email at the counter."
            value={form.offerDescription}
            onChange={e => set('offerDescription', e.target.value)}
            onBlur={() => blur('offerDescription')}/>
          <FieldError msg={err('offerDescription')}/>
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
            <input className="form-input" type="date" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)}/>
          </div>
        </div>
        <div className="mt-2 rounded-xl overflow-hidden border border-blue-pale">
          <div className="bg-blue-deeper px-4 py-2 text-xs text-white/60 font-medium">
            Preview — queuepon.com/offers/{slug}
          </div>
          <div className="bg-gradient-to-br from-blue-deeper to-blue p-6 text-center text-white">
            <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">{form.restaurantName || 'Your Restaurant'}</div>
            <div className="text-xl font-bold text-yellow-200 mb-1">{form.offerTitle || 'Your Offer Headline'}</div>
            <div className="text-xs opacity-75 mb-4">{form.offerDescription || 'Your offer description appears here'}</div>
            <div className="flex gap-2 max-w-xs mx-auto">
              <input readOnly className="flex-1 rounded-lg px-3 py-2 text-xs text-tan bg-white" placeholder="Your email"/>
              <button className="bg-yellow-300 text-tan-dark text-xs font-bold px-3 py-2 rounded-lg">Claim →</button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-6">
        <button onClick={back} className="btn-ghost">← Back</button>
        <button onClick={handleNext} className="btn-primary">Continue →</button>
      </div>
    </div>
  )
}

// ── STEP 4 ─────────────────────────────────────────────────────────────────
function Step4({ form, set, next, back }: { form: FormData; set: (f: keyof FormData, v: any) => void; next: () => void; back: () => void }) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.adImage)              e.adImage     = 'Please upload a photo for your ad'
    if (!form.adHeadline.trim())    e.adHeadline  = 'Ad headline is required'
    return e
  }

  const handleNext = () => {
    const e = validate()
    setErrors(e)
    setTouched({ adImage:true, adHeadline:true })
    if (Object.keys(e).length === 0) next()
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    set('adImage', file)
    const reader = new FileReader()
    reader.onload = ev => set('adImagePreview', ev.target?.result as string)
    reader.readAsDataURL(file)
    // Clear image error once uploaded
    setErrors(prev => { const n = {...prev}; delete n.adImage; return n })
    setTouched(prev => ({ ...prev, adImage: true }))
  }

  const PRESET_COLORS = ['#588aad','#716557','#2a5070','#1a1a1a','#8B0000','#2E7D32']
  const slug = form.restaurantName.toLowerCase().replace(/\s+/g, '') || 'yourrestaurant'

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="eyebrow">Step 4 of 5</div>
        <h2 className="text-2xl font-bold text-tan mt-1">Ad Creative</h2>
        <p className="text-tan-light mt-2 text-sm">Your ad runs on Facebook + Instagram, targeted to ZIP {form.zipCode || 'your zip'}.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-5">
          {/* Photo upload */}
          <div className="card">
            <label className="form-label">Photo Upload</label>
            <p className="text-xs text-tan-light mb-3">2000px or larger · JPG or PNG</p>
            <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all
              ${form.adImagePreview ? 'border-blue bg-blue-xpale' :
                touched.adImage && errors.adImage ? 'border-red-400 bg-red-50' :
                'border-cream-dark hover:border-blue hover:bg-blue-xpale'}`}>
              {form.adImagePreview
                ? <div className="text-center"><div className="text-2xl mb-1">✅</div><div className="text-sm font-semibold text-blue">Photo uploaded</div><div className="text-xs text-tan-light mt-1">{form.adImage?.name}</div></div>
                : <div className="text-center"><div className="text-3xl mb-2">📸</div><div className="text-sm font-semibold text-tan">Click to upload</div><div className="text-xs text-tan-light mt-1">JPG, PNG — 2000px+ recommended</div></div>
              }
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload}/>
            </label>
            <FieldError msg={touched.adImage ? errors.adImage : undefined}/>
          </div>

          {/* Template */}
          <div className="card">
            <label className="form-label">Ad Template</label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {(['full_bleed','split'] as const).map(t => (
                <button key={t} onClick={() => set('adTemplate', t)}
                  className={`p-3 rounded-xl border-2 text-left transition-all
                    ${form.adTemplate === t ? 'border-blue bg-blue-pale' : 'border-cream-dark hover:border-blue/40'}`}>
                  <div className="w-full h-16 rounded-lg overflow-hidden mb-2 relative">
                    {t === 'full_bleed'
                      ? <><div className="absolute inset-0 bg-gradient-to-b from-blue-light to-blue-deeper"/><div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/60 to-transparent"/><div className="absolute bottom-1 left-2 text-white text-xs font-bold">Headline</div></>
                      : <><div className="h-8 bg-blue-light"/><div className="h-8 flex items-center px-2" style={{backgroundColor:form.adColor}}><div className="text-white text-xs font-bold">Headline</div></div></>
                    }
                  </div>
                  <div className="text-xs font-semibold text-tan">{t === 'full_bleed' ? 'Full Bleed' : 'Split'}</div>
                  <div className="text-xs text-tan-light">{t === 'full_bleed' ? 'Photo fills entire frame' : 'Photo top, color bottom'}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          {form.adTemplate === 'split' && (
            <div className="card">
              <label className="form-label">Bottom Panel Color</label>
              <div className="flex items-center gap-3 mt-2">
                <input type="color" value={form.adColor} onChange={e => set('adColor', e.target.value)}
                  className="w-12 h-10 rounded-lg border border-cream-dark cursor-pointer"/>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button key={c} onClick={() => set('adColor', c)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${form.adColor === c ? 'border-blue scale-110' : 'border-white'}`}
                      style={{backgroundColor:c}}/>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Ad copy */}
          <div className="card">
            <div className="form-group">
              <label className="form-label">Ad Headline <span className="text-tan-light normal-case font-normal">({form.adHeadline.length}/40)</span></label>
              <input className={`form-input ${touched.adHeadline && errors.adHeadline ? 'border-red-400' : ''}`}
                placeholder="Free Pizza Buffet Every Friday" maxLength={40}
                value={form.adHeadline}
                onChange={e => set('adHeadline', e.target.value)}
                onBlur={() => setTouched(t => ({...t, adHeadline:true}))}/>
              <FieldError msg={touched.adHeadline ? errors.adHeadline : undefined}/>
              <p className="text-xs text-tan-light mt-1">Can differ slightly from your landing page headline.</p>
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Subheadline <span className="text-tan-light normal-case font-normal">({form.adSubheadline.length}/80)</span></label>
              <input className="form-input" placeholder="Louisville locals only · Claim yours at queuepon.com"
                maxLength={80} value={form.adSubheadline} onChange={e => set('adSubheadline', e.target.value)}/>
            </div>
          </div>
        </div>

        {/* Live preview */}
        <div>
          <div className="form-label mb-3">Live Ad Preview</div>
          <div className="rounded-2xl overflow-hidden shadow-card-lg border border-cream-dark">
            <div className="bg-white px-4 py-3 flex items-center gap-2.5 border-b border-cream-dark">
              <div className="w-9 h-9 rounded-full bg-blue flex items-center justify-center text-white text-xs font-bold flex-shrink-0">Q</div>
              <div>
                <div className="text-xs font-bold text-gray-800">Queuepon</div>
                <div className="text-xs text-gray-400">Sponsored · 📍 {form.zipCode || 'Your ZIP'}</div>
              </div>
            </div>
            <div className="relative aspect-square overflow-hidden bg-blue-pale">
              {form.adImagePreview ? (
                <>
                  <img src={form.adImagePreview} alt="Ad preview" className="w-full h-full object-cover"/>
                  {form.adTemplate === 'full_bleed'
                    ? <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-5">
                        <div className="text-white font-bold text-lg leading-tight">{form.adHeadline || 'Your Ad Headline'}</div>
                        <div className="text-white/80 text-sm mt-1">{form.adSubheadline || 'Your subheadline'}</div>
                        <div className="text-white/40 text-xs mt-2">queuepon.com/{slug}</div>
                      </div>
                    : <div className="absolute bottom-0 left-0 right-0 p-4" style={{backgroundColor:form.adColor}}>
                        <div className="text-white font-bold text-lg leading-tight">{form.adHeadline || 'Your Ad Headline'}</div>
                        <div className="text-white/80 text-sm mt-1">{form.adSubheadline || 'Your subheadline'}</div>
                        <div className="text-white/40 text-xs mt-1.5">queuepon.com/{slug}</div>
                      </div>
                  }
                </>
              ) : (
                <div className="w-full h-full flex flex-col justify-end">
                  {form.adTemplate === 'split' && <div className="flex-1 bg-blue-light/40 flex items-center justify-center"><span className="text-blue/40 text-sm">Upload photo to preview</span></div>}
                  <div className={`p-5 ${form.adTemplate === 'full_bleed' ? 'bg-gradient-to-br from-blue-deeper to-blue h-full flex flex-col justify-end' : ''}`}
                    style={form.adTemplate === 'split' ? {backgroundColor:form.adColor} : {}}>
                    <div className="text-white font-bold text-lg">{form.adHeadline || 'Your Ad Headline'}</div>
                    <div className="text-white/75 text-sm mt-1">{form.adSubheadline || 'Subheadline here'}</div>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-white px-4 py-3">
              <div className="text-xs text-gray-400 uppercase tracking-wider">queuepon.com</div>
              <div className="text-sm font-bold text-gray-800 mt-0.5">{form.adHeadline || 'Your Ad Headline'}</div>
            </div>
          </div>
          <p className="text-xs text-tan-light text-center mt-3">Facebook Feed + Instagram Feed · ZIP {form.zipCode || 'your zip'} + 5mi radius</p>
        </div>
      </div>
      <div className="flex justify-between mt-8">
        <button onClick={back} className="btn-ghost">← Back</button>
        <button onClick={handleNext} className="btn-primary">Continue to Payment →</button>
      </div>
    </div>
  )
}

// ── STEP 5 ─────────────────────────────────────────────────────────────────
function Step5({ form, back }: { form: FormData; back: () => void }) {
  return <Step5Payment form={form} back={back} />
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function SignupPage() {
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormData>({
    plan:'expand',
    firstName:'', lastName:'', restaurantName:'',
    email:'', phone:'', zipCode:'', address:'', restaurantType:'',
    offerTitle:'', offerDescription:'', offerType:'free_item', expiryDate:'',
    adHeadline:'', adSubheadline:'', adTemplate:'full_bleed',
    adColor:'#588aad', adImage:null, adImagePreview:'',
  })

  const set  = (field: keyof FormData, value: any) => setForm(prev => ({...prev, [field]: value}))
  const next = () => { setStep(s => Math.min(s + 1, 5) as Step); window.scrollTo({top:0, behavior:'smooth'}) }
  const back = () => { setStep(s => Math.max(s - 1, 1) as Step); window.scrollTo({top:0, behavior:'smooth'}) }

  return (
    <div className="min-h-screen bg-cream">
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-cream-dark flex items-center justify-between px-6 md:px-10 shadow-sm">
        <Link href="/"><Logo variant="dark" size="md"/></Link>
        <div className="text-sm text-tan-light">
          Already have an account?{' '}
          <Link href="/login" className="text-blue font-semibold">Log in</Link>
        </div>
      </nav>
      <div className="pt-24 pb-20 px-4 md:px-8">
        <StepBar current={step}/>
        {step === 1 && <Step1 form={form} set={set} next={next}/>}
        {step === 2 && <Step2 form={form} set={set} next={next} back={back}/>}
        {step === 3 && <Step3 form={form} set={set} next={next} back={back}/>}
        {step === 4 && <Step4 form={form} set={set} next={next} back={back}/>}
        {step === 5 && <Step5 form={form} back={back}/>}
      </div>
    </div>
  )
}
