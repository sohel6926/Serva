import React from 'react';

export const SERVA_LOGO_HORIZONTAL =
  '/assets/brand/serva-logo-horizontal.jpg';
export const SERVA_LOGO_STACKED =
  '/assets/brand/serva-logo-stacked.jpg';

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
