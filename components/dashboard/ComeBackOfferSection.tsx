'use client'

import { useRef, useState } from 'react'

interface Props {
  restaurantId:          string
  comeBackOfferText:     string
  comeBackOfferImageUrl: string
}

export function ComeBackOfferSection({
  restaurantId,
  comeBackOfferText:     initialText,
  comeBackOfferImageUrl: initialImageUrl,
}: Props) {
  const [open,     setOpen]     = useState(false)
  const [text,     setText]     = useState(initialText)
  const [imageUrl, setImageUrl] = useState(initialImageUrl)
  const [preview,  setPreview]  = useState(initialImageUrl)
  const [imgFile,  setImgFile]  = useState<File | null>(null)
  const [saving,   setSaving]   = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImgFile(file)
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const save = async () => {
    setSaving(true)
    try {
      let finalUrl = imageUrl

      if (imgFile) {
        const fd  = new FormData()
        fd.append('file',   imgFile)
        fd.append('bucket', 'offer-images')
        fd.append('path',   `come-back/${restaurantId}.${imgFile.name.split('.').pop()}`)
        const res  = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (data.url) finalUrl = data.url
      }

      await fetch('/api/restaurant/come-back-offer', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ restaurantId, comeBackOfferText: text, comeBackOfferImageUrl: finalUrl }),
      })

      setImageUrl(finalUrl)
      setImgFile(null)
    } finally {
      setSaving(false)
      setOpen(false)
    }
  }

  return (
    <div className="border-t border-cream-dark mt-4 pt-4">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-sm text-tan-light hover:text-tan transition-colors w-full text-left">
        <span>↩️</span>
        <span className="font-medium">Come Back Offer</span>
        {!open && (
          <span className="ml-auto text-blue text-xs font-semibold">
            {text ? 'Edit →' : 'Set up →'}
          </span>
        )}
      </button>
      {!open && text && (
        <p className="text-xs text-tan-light mt-1 truncate">{text}</p>
      )}
      {open && (
        <div className="mt-3 space-y-3">
          <p className="text-xs text-tan-light">
            Sent automatically on Day 25 to bring first-time visitors back. Leave blank to skip.
          </p>
          <input
            className="form-input text-sm"
            placeholder="e.g. 20% off your next visit — just show this email!"
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden hover:border-blue/40 hover:bg-blue-xpale"
            style={{ minHeight: '80px' }}>
            {preview
              ? <img src={preview} alt="Come Back offer" className="w-full max-h-40 object-cover"/>
              : <div className="text-center py-4 px-3">
                  <div className="text-xl text-tan-light mb-1">📸</div>
                  <div className="text-xs text-tan-light">Upload image (optional)</div>
                </div>
            }
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile}/>
          </label>
          {preview && (
            <button type="button" onClick={() => { setPreview(''); setImageUrl(''); setImgFile(null) }}
              className="text-xs text-red-400 hover:text-red-600">
              Remove image
            </button>
          )}
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
