'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface TooltipIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
  tooltipSide?: 'top' | 'bottom';
  wrapperClassName?: string;
}

export default function TooltipIconButton({
  label,
  children,
  className = '',
  tooltipSide = 'top',
  wrapperClassName = '',
  type = 'button',
  ...props
}: TooltipIconButtonProps) {
  const tooltipPosition =
    tooltipSide === 'bottom'
      ? 'top-full left-1/2 mt-2 -translate-x-1/2'
      : 'bottom-full left-1/2 mb-2 -translate-x-1/2';

  return (
    <div className={`group relative inline-flex ${wrapperClassName}`}>
      <button
        type={type}
        aria-label={label}
        className={className}
        {...props}
      >
        {children}
      </button>
      <span
        className={`pointer-events-none absolute ${tooltipPosition} z-[60] whitespace-nowrap rounded-lg bg-stone-900/95 px-2.5 py-1 text-[10px] font-medium tracking-wide text-white opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100`}
      >
        {label}
      </span>
    </div>
  );
}
