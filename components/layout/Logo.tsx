'use client'

interface LogoProps {
  variant?: 'dark' | 'white'
  size?: 'sm' | 'md' | 'lg'
  showWordmark?: boolean
}

const sizes = {
  sm: { icon: 28, text: 'text-base' },
  md: { icon: 34, text: 'text-lg' },
  lg: { icon: 44, text: 'text-2xl' },
}

// SVG icon built from the actual Queuepon mark geometry
function QIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer ring */}
      <path d="M85 48A37 37 0 1 0 63 80" stroke={color} strokeWidth="9" strokeLinecap="round"/>
      {/* Inner circle */}
      <circle cx="48" cy="46" r="16" stroke={color} strokeWidth="8"/>
      {/* Tail curving down */}
      <path d="M63 80 Q74 90 68 100 Q58 108 46 98 Q24 88 22 68" stroke={color} strokeWidth="9" strokeLinecap="round" fill="none"/>
      {/* Arrow right */}
      <path d="M63 80 L83 80" stroke={color} strokeWidth="8" strokeLinecap="round"/>
    </svg>
  )
}

export function Logo({ variant = 'dark', size = 'md', showWordmark = true }: LogoProps) {
  const iconColor = variant === 'white' ? '#ffffff' : '#716557'
  const textColor = variant === 'white' ? 'text-white' : 'text-tan-DEFAULT'
  const { icon, text } = sizes[size]

  return (
    <div className="flex items-center gap-2.5">
      <QIcon size={icon} color={iconColor} />
      {showWordmark && (
        <span className={`font-extrabold tracking-tight ${text} ${textColor}`}>
          queuepon
        </span>
      )}
    </div>
  )
}
