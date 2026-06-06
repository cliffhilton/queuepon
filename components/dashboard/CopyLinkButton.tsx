'use client'

import { useState } from 'react'

export function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/offers/${slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={handleCopy}
      className="text-xs font-semibold transition-colors hover:underline"
      style={{ color: copied ? '#2e7d32' : '#588aad' }}>
      {copied ? '✓ Copied!' : '🔗 Copy Link'}
    </button>
  )
}
