import { useEffect, useState, type CSSProperties } from 'react'

import { cn } from '../../lib/cn'

interface UserAvatarProps {
  name: string
  src?: string | null
  initials?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  sizeClassName?: string
  className?: string
  imageClassName?: string
  fallbackClassName?: string
  fallbackStyle?: CSSProperties
  imageLoading?: 'eager' | 'lazy'
  roundedClassName?: string
}

const sizeClasses = {
  xs: 'h-7 w-7 text-[9px]',
  sm: 'h-8 w-8 text-[10px]',
  md: 'h-10 w-10 text-[12px]',
  lg: 'h-12 w-12 text-[14px]',
  xl: 'h-20 w-20 text-[22px]',
} as const

const initialsFor = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'IM'

export default function UserAvatar({
  name,
  src,
  initials,
  size = 'md',
  sizeClassName,
  className,
  imageClassName,
  fallbackClassName,
  fallbackStyle,
  imageLoading,
  roundedClassName = 'rounded-full',
}: UserAvatarProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null)

  useEffect(() => {
    if (src !== failedSource) setFailedSource(null)
  }, [failedSource, src])

  const showImage = Boolean(src) && failedSource !== src

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden font-bold',
        roundedClassName,
        sizeClassName || sizeClasses[size],
        !showImage &&
          'bg-linear-to-br from-[#b84c2b] to-[#e8816a] text-white',
        !showImage && fallbackClassName,
        className,
      )}
      style={!showImage ? fallbackStyle : undefined}
      aria-label={`${name}'s avatar`}
    >
      {showImage ? (
        <img
          src={src ?? undefined}
          alt={`${name}'s avatar`}
          className={cn('h-full w-full object-cover', imageClassName)}
          loading={imageLoading}
          onError={() => setFailedSource(src ?? null)}
        />
      ) : (
        initials || initialsFor(name)
      )}
    </span>
  )
}
