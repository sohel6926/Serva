import React from 'react';

export function HomeServicesIllustration() {
  return (
    <svg viewBox="0 0 100 80" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="roofGrad" x1="50" y1="12" x2="50" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="wallGrad" x1="50" y1="36" x2="50" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E2E8F0" />
        </linearGradient>
        <linearGradient id="doorGrad" x1="42" y1="46" x2="42" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
        <filter id="houseShadow" x="10" y="8" width="80" height="66" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0A1F5C" floodOpacity="0.12" />
        </filter>
      </defs>

      <g filter="url(#houseShadow)">
        {/* Ground grass shadow */}
        <ellipse cx="50" cy="69" rx="36" ry="5" fill="#CBD5E1" opacity="0.6" />

        {/* Chimney */}
        <rect x="62" y="16" width="6" height="12" rx="1" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
        <rect x="61" y="14" width="8" height="3" rx="1" fill="#64748B" />

        {/* Bushes */}
        <circle cx="22" cy="58" r="9" fill="#22C55E" />
        <circle cx="27" cy="62" r="7" fill="#16A34A" />
        <circle cx="78" cy="58" r="9" fill="#22C55E" />
        <circle cx="73" cy="62" r="7" fill="#16A34A" />

        {/* House Main Body */}
        <rect x="26" y="34" width="48" height="34" rx="2" fill="url(#wallGrad)" stroke="#CBD5E1" strokeWidth="1" />

        {/* Roof */}
        <path d="M50 12L18 36H82L50 12Z" fill="url(#roofGrad)" />
        <path d="M50 14L22 35H78L50 14Z" fill="#3B82F6" opacity="0.4" />
        <rect x="16" y="34" width="68" height="3" rx="1.5" fill="#1E40AF" />

        {/* Attic Window */}
        <circle cx="50" cy="25" r="4.5" fill="#93C5FD" stroke="#1E40AF" strokeWidth="1.2" />
        <path d="M50 20.5V29.5M45.5 25H54.5" stroke="#1E40AF" strokeWidth="1" />

        {/* Front Door */}
        <rect x="36" y="45" width="14" height="23" rx="1.5" fill="url(#doorGrad)" />
        <circle cx="47" cy="57" r="1.2" fill="#FCD34D" />

        {/* Ground Window */}
        <rect x="56" y="47" width="12" height="12" rx="1.5" fill="#BFDBFE" stroke="#60A5FA" strokeWidth="1" />
        <path d="M62 47V59M56 53H68" stroke="#3B82F6" strokeWidth="1" />

        {/* Foundation */}
        <rect x="25" y="66" width="50" height="3" rx="1" fill="#94A3B8" />
      </g>
    </svg>
  );
}

export function ConstructionIllustration() {
  return (
    <svg viewBox="0 0 100 80" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="helmetGrad" x1="50" y1="18" x2="50" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBF24" />
          <stop offset="0.6" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="brickGrad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#EF4444" />
          <stop offset="1" stopColor="#B91C1C" />
        </linearGradient>
        <filter id="constShadow" x="12" y="14" width="76" height="58" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0A1F5C" floodOpacity="0.14" />
        </filter>
      </defs>

      <g filter="url(#constShadow)">
        {/* Ground shadow */}
        <ellipse cx="50" cy="68" rx="34" ry="4.5" fill="#CBD5E1" opacity="0.6" />

        {/* Clay Bricks Stack */}
        <rect x="42" y="52" width="28" height="9" rx="1.5" fill="url(#brickGrad)" stroke="#991B1B" strokeWidth="0.8" />
        <rect x="42" y="60" width="14" height="8" rx="1.5" fill="url(#brickGrad)" stroke="#991B1B" strokeWidth="0.8" />
        <rect x="56" y="60" width="18" height="8" rx="1.5" fill="url(#brickGrad)" stroke="#991B1B" strokeWidth="0.8" />
        <rect x="30" y="60" width="12" height="8" rx="1.5" fill="url(#brickGrad)" stroke="#991B1B" strokeWidth="0.8" />

        {/* Mortar lines */}
        <line x1="42" y1="60" x2="74" y2="60" stroke="#FEE2E2" strokeWidth="0.8" />

        {/* Safety Helmet Dome */}
        <path
          d="M26 46C26 31 35 18 50 18C65 18 74 31 74 46H26Z"
          fill="url(#helmetGrad)"
        />
        {/* Helmet Ridge */}
        <path
          d="M47 18C47 18 48 30 48 46H52C52 30 53 18 53 18H47Z"
          fill="#FDE68A"
        />
        {/* Helmet Rim / Brim */}
        <ellipse cx="50" cy="46" rx="27" ry="5.5" fill="#D97706" />
        <ellipse cx="50" cy="45" rx="26" ry="4.5" fill="#F59E0B" />
        <path d="M24 45C24 47.5 35.6 49.5 50 49.5C64.4 49.5 76 47.5 76 45C76 43 64.4 42 50 42C35.6 42 24 43 24 45Z" fill="#FBBF24" />

        {/* Specular highlight */}
        <path
          d="M32 36C34 26 42 21 50 21"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.7"
        />
      </g>
    </svg>
  );
}

export function AgricultureIllustration() {
  return (
    <svg viewBox="0 0 100 80" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fieldGrad" x1="50" y1="46" x2="50" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#86EFAC" />
          <stop offset="1" stopColor="#22C55E" />
        </linearGradient>
        <linearGradient id="tractorGrad" x1="50" y1="26" x2="50" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EF4444" />
          <stop offset="1" stopColor="#DC2626" />
        </linearGradient>
        <filter id="agriShadow" x="12" y="16" width="76" height="56" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#064E3B" floodOpacity="0.14" />
        </filter>
      </defs>

      <g filter="url(#agriShadow)">
        {/* Green Field with Crop Rows */}
        <path d="M14 55C14 48 30 46 50 46C70 46 86 48 86 55C86 64 70 69 50 69C30 69 14 64 14 55Z" fill="url(#fieldGrad)" />
        {/* Crop lines */}
        <path d="M22 56L36 67M35 53L48 68M52 52L60 68M68 53L73 67" stroke="#15803D" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

        {/* Small Trees in distance */}
        <circle cx="25" cy="46" r="4.5" fill="#16A34A" />
        <circle cx="31" cy="47" r="3.5" fill="#22C55E" />

        {/* Tractor Body */}
        {/* Cabin */}
        <rect x="54" y="24" width="16" height="18" rx="2" fill="#E2E8F0" stroke="#334155" strokeWidth="1" />
        <rect x="56" y="26" width="12" height="10" rx="1" fill="#93C5FD" />
        <rect x="52" y="22" width="20" height="3" rx="1.5" fill="#EF4444" />

        {/* Engine Hood */}
        <path d="M42 33H54V44H40C40 44 40 35 42 33Z" fill="url(#tractorGrad)" />
        <rect x="38" y="36" width="3" height="6" fill="#FBBF24" />
        {/* Exhaust pipe */}
        <rect x="45" y="25" width="2" height="9" fill="#475569" />
        <path d="M45 25C45 24 47 24 48 24" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />

        {/* Big Rear Wheel */}
        <circle cx="62" cy="48" r="9.5" fill="#1E293B" />
        <circle cx="62" cy="48" r="6" fill="#F59E0B" />
        <circle cx="62" cy="48" r="2.5" fill="#1E293B" />

        {/* Small Front Wheel */}
        <circle cx="43" cy="51" r="5.5" fill="#1E293B" />
        <circle cx="43" cy="51" r="3" fill="#F59E0B" />
        <circle cx="43" cy="51" r="1.2" fill="#1E293B" />
      </g>
    </svg>
  );
}

export function EventIllustration() {
  return (
    <svg viewBox="0 0 100 80" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="canopyRed" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#EF4444" />
          <stop offset="1" stopColor="#B91C1C" />
        </linearGradient>
        <linearGradient id="canopyGold" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#FDE047" />
          <stop offset="1" stopColor="#EAB308" />
        </linearGradient>
        <filter id="eventShadow" x="12" y="12" width="76" height="60" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#581C87" floodOpacity="0.14" />
        </filter>
      </defs>

      <g filter="url(#eventShadow)">
        {/* Ground grass ellipse */}
        <ellipse cx="50" cy="67" rx="34" ry="5" fill="#CBD5E1" opacity="0.6" />

        {/* Tent Poles & Inside Banquet Table */}
        <rect x="22" y="44" width="3" height="22" fill="#78350F" />
        <rect x="75" y="44" width="3" height="22" fill="#78350F" />
        <rect x="49" y="32" width="2" height="34" fill="#78350F" />

        {/* Warm Golden Glow Inside */}
        <path d="M24 45H76L68 66H32L24 45Z" fill="#FEF3C7" opacity="0.8" />
        {/* Banquet Table */}
        <ellipse cx="50" cy="61" rx="14" ry="4" fill="#F59E0B" />
        <rect x="40" y="61" width="20" height="5" fill="#D97706" />

        {/* Curtains / Drapery */}
        <path d="M22 44C26 52 30 58 34 66H24L22 44Z" fill="url(#canopyRed)" />
        <path d="M78 44C74 52 70 58 66 66H76L78 44Z" fill="url(#canopyRed)" />

        {/* Canopy Roof - Striped */}
        <path d="M50 16L18 44H82L50 16Z" fill="url(#canopyGold)" />
        {/* Red Stripes on canopy */}
        <path d="M50 16L32 44H22L50 16Z" fill="url(#canopyRed)" />
        <path d="M50 16L45 44H55L50 16Z" fill="url(#canopyRed)" />
        <path d="M50 16L68 44H78L50 16Z" fill="url(#canopyRed)" />

        {/* Scalloped Valance Trim */}
        <path
          d="M18 44Q24 48 30 44Q36 48 42 44Q48 48 54 44Q60 48 66 44Q72 48 78 44Q81 46 82 44"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Golden Finial Ball & Flying Flag */}
        <circle cx="50" cy="16" r="2.5" fill="#FBBF24" />
        <path d="M50 14V8M50 8L60 11L50 14" fill="#0B5FD9" stroke="#0B5FD9" strokeWidth="1" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function MovingIllustration() {
  return (
    <svg viewBox="0 0 100 80" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="truckBody" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#FBBF24" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="truckCab" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E2E8F0" />
        </linearGradient>
        <filter id="truckShadow" x="12" y="18" width="76" height="54" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0A1F5C" floodOpacity="0.14" />
        </filter>
      </defs>

      <g filter="url(#truckShadow)">
        {/* Ground shadow */}
        <ellipse cx="50" cy="67" rx="34" ry="4.5" fill="#CBD5E1" opacity="0.6" />

        {/* Cardboard Boxes on side */}
        <rect x="18" y="52" width="12" height="12" rx="1" fill="#D97706" stroke="#92400E" strokeWidth="0.8" />
        <rect x="23" y="44" width="10" height="9" rx="1" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
        {/* Box tape */}
        <line x1="24" y1="52" x2="24" y2="64" stroke="#92400E" strokeWidth="1" />
        <line x1="28" y1="44" x2="28" y2="53" stroke="#B45309" strokeWidth="1" />

        {/* Truck Cargo Box */}
        <rect x="32" y="28" width="34" height="30" rx="2" fill="url(#truckBody)" stroke="#D97706" strokeWidth="1" />
        <line x1="32" y1="42" x2="66" y2="42" stroke="#D97706" strokeWidth="1" />

        {/* Truck Cabin */}
        <path d="M66 36H75C78 36 81 40 82 45L84 52V58H66V36Z" fill="url(#truckCab)" stroke="#CBD5E1" strokeWidth="1" />
        {/* Cab Windshield */}
        <path d="M68 39H74C76 39 78 42 79 46L80 48H68V39Z" fill="#60A5FA" />
        {/* Headlight & Bumper */}
        <rect x="83" y="53" width="2" height="3" rx="1" fill="#FCD34D" />
        <rect x="65" y="57" width="20" height="3" rx="1" fill="#475569" />

        {/* Truck Wheels */}
        <circle cx="43" cy="62" r="6" fill="#1E293B" />
        <circle cx="43" cy="62" r="3" fill="#E2E8F0" />
        <circle cx="75" cy="62" r="6" fill="#1E293B" />
        <circle cx="75" cy="62" r="3" fill="#E2E8F0" />
      </g>
    </svg>
  );
}

export function RepairIllustration() {
  return (
    <svg viewBox="0 0 100 80" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wrenchSteel" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#CBD5E1" />
          <stop offset="0.5" stopColor="#94A3B8" />
          <stop offset="1" stopColor="#64748B" />
        </linearGradient>
        <linearGradient id="driverYellow" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FBBF24" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
        <filter id="repairShadow" x="18" y="14" width="64" height="54" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0A1F5C" floodOpacity="0.16" />
        </filter>
      </defs>

      <g filter="url(#repairShadow)">
        {/* Ground shadow */}
        <ellipse cx="50" cy="66" rx="26" ry="4" fill="#CBD5E1" opacity="0.6" />

        {/* Screwdriver (Diagonal 1) */}
        <g transform="rotate(45 50 40)">
          {/* Steel Shaft */}
          <rect x="48.5" y="16" width="3" height="24" rx="1" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="0.8" />
          {/* Cross Tip */}
          <path d="M48.5 16L50 12L51.5 16H48.5Z" fill="#64748B" />
          {/* Handle */}
          <rect x="46" y="38" width="8" height="24" rx="3" fill="url(#driverYellow)" stroke="#D97706" strokeWidth="1" />
          <line x1="47" y1="44" x2="53" y2="44" stroke="#D97706" strokeWidth="1" />
          <line x1="47" y1="50" x2="53" y2="50" stroke="#D97706" strokeWidth="1" />
          <line x1="47" y1="56" x2="53" y2="56" stroke="#D97706" strokeWidth="1" />
        </g>

        {/* Wrench (Diagonal 2) */}
        <g transform="rotate(-45 50 40)">
          {/* Handle */}
          <rect x="47" y="32" width="6" height="30" rx="3" fill="#2563EB" stroke="#1D4ED8" strokeWidth="1" />
          <circle cx="50" cy="56" r="1.5" fill="#FFFFFF" />
          {/* Chrome Neck & Head */}
          <rect x="47.5" y="24" width="5" height="10" fill="url(#wrenchSteel)" />
          {/* Wrench Jaw */}
          <path
            d="M44 26C42 22 43 14 50 14C57 14 58 22 56 26L52 24C53 20 52 18 50 18C48 18 47 20 48 24L44 26Z"
            fill="url(#wrenchSteel)"
            stroke="#475569"
            strokeWidth="0.8"
          />
        </g>
      </g>
    </svg>
  );
}

export function ManpowerIllustration() {
  return (
    <svg viewBox="0 0 100 80" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="centerPolo" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="sideOrange" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#FB923C" />
          <stop offset="1" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id="sideCyan" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#38BDF8" />
          <stop offset="1" stopColor="#0284C7" />
        </linearGradient>
        <filter id="manpowerShadow" x="14" y="16" width="72" height="56" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0A1F5C" floodOpacity="0.14" />
        </filter>
      </defs>

      <g filter="url(#manpowerShadow)">
        {/* Ground shadow */}
        <ellipse cx="50" cy="68" rx="30" ry="4" fill="#CBD5E1" opacity="0.6" />

        {/* Worker Left (Cyan) */}
        <ellipse cx="32" cy="62" rx="12" ry="9" fill="url(#sideCyan)" />
        <circle cx="32" cy="40" r="6" fill="#FBBF24" />
        {/* Hair */}
        <path d="M26 39C26 34 28 33 32 33C36 33 38 34 38 39H26Z" fill="#334155" />

        {/* Worker Right (Orange) */}
        <ellipse cx="68" cy="62" rx="12" ry="9" fill="url(#sideOrange)" />
        <circle cx="68" cy="40" r="6" fill="#FBBF24" />
        {/* Hair */}
        <path d="M62 39C62 34 64 33 68 33C72 33 74 34 74 39H62Z" fill="#334155" />

        {/* Worker Center (Royal Blue - Front & Prominent) */}
        <ellipse cx="50" cy="61" rx="15" ry="11" fill="url(#centerPolo)" />
        <circle cx="50" cy="36" r="7.5" fill="#FCD34D" />
        {/* Cap / Hair */}
        <path d="M42 34C42 28 45 27 50 27C55 27 58 28 58 34H42Z" fill="#1E3A8A" />
        <ellipse cx="50" cy="33" rx="9" ry="2" fill="#1D4ED8" />
        {/* Polo Collar */}
        <path d="M47 50L50 54L53 50H47Z" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

export function MoreServicesIllustration() {
  return (
    <svg viewBox="0 0 100 80" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gridPill" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
        <filter id="pillShadow" x="22" y="16" width="56" height="50" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#0B5FD9" floodOpacity="0.2" />
        </filter>
      </defs>

      <g filter="url(#pillShadow)">
        <rect x="30" y="22" width="16" height="16" rx="5" fill="url(#gridPill)" />
        <rect x="54" y="22" width="16" height="16" rx="5" fill="url(#gridPill)" />
        <rect x="30" y="44" width="16" height="16" rx="5" fill="url(#gridPill)" />
        <rect x="54" y="44" width="16" height="16" rx="5" fill="url(#gridPill)" />

        {/* Highlights */}
        <circle cx="34" cy="26" r="1.5" fill="#FFFFFF" opacity="0.6" />
        <circle cx="58" cy="26" r="1.5" fill="#FFFFFF" opacity="0.6" />
        <circle cx="34" cy="48" r="1.5" fill="#FFFFFF" opacity="0.6" />
        <circle cx="58" cy="48" r="1.5" fill="#FFFFFF" opacity="0.6" />
      </g>
    </svg>
  );
}
