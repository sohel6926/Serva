import React from 'react';

export const SERVA_LOGO_HORIZONTAL =
  '/assets/aistudio/3961820c-62e1-4ebf-bc7b-216e14457099_cfc65845.jpg';
export const SERVA_LOGO_STACKED =
  '/assets/aistudio/78042e5d-7898-4ab6-a6a0-4d33c7f11ff4_0788bcdb.jpg';

interface BrandLogoProps {
  variant?: 'horizontal' | 'stacked';
  className?: string;
}

export function BrandLogo({ variant = 'horizontal', className = '' }: BrandLogoProps) {
  const src = variant === 'stacked' ? SERVA_LOGO_STACKED : SERVA_LOGO_HORIZONTAL;
  return (
    <span className={`inline-flex items-center bg-white rounded-lg p-1 ${className}`}>
      <img
        src={src}
        alt="SERVA — Multiple Services Provider"
        referrerPolicy="no-referrer"
        className={
          variant === 'stacked'
            ? 'h-20 w-auto object-contain select-none'
            : 'h-8 sm:h-9 w-auto object-contain select-none'
        }
      />
    </span>
  );
}
