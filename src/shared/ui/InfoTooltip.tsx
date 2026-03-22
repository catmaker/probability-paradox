import { useState } from 'react'
import type { ReactNode } from 'react'

interface InfoTooltipProps {
  content: ReactNode
}

export const InfoTooltip = ({ content }: InfoTooltipProps) => {
  const [open, setOpen] = useState(false)

  return (
    <span className="relative inline-flex items-center align-middle">
      <button
        type="button"
        aria-label="추가 설명 보기"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-4.5 w-4.5 items-center justify-center rounded-full border border-cyan-700/70 text-[10px] font-bold text-cyan-300 transition-colors hover:border-cyan-400 hover:text-cyan-200"
        style={{ width: '1.15rem', height: '1.15rem', flexShrink: 0 }}
      >
        ?
      </button>

      {open && (
        <div
          className="absolute left-1/2 top-full z-20 mt-2.5 w-56 -translate-x-1/2 rounded-xl border border-cyan-800/60 bg-black/95 px-4 py-3 text-left text-[11px] leading-5 text-cyan-200 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
          style={{ marginTop: '0.8rem', width: '14.5rem', padding: '0.9rem 1rem', lineHeight: 1.65 }}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {content}
        </div>
      )}
    </span>
  )
}
