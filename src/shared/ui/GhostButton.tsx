import type { ButtonHTMLAttributes } from 'react'

interface GhostButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'muted'
}

export const GhostButton = ({ variant = 'primary', className = '', style, ...props }: GhostButtonProps) => {
  const base = 'rounded-xl tracking-widest text-sm transition-all'
  const variants = {
    primary: 'border border-cyan-400 text-cyan-300 hover:bg-cyan-400/10',
    muted: 'border border-cyan-900 text-cyan-700 hover:bg-cyan-900/20',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      style={{ padding: '0.6rem 1.5rem', ...style }}
      {...props}
    />
  )
}
