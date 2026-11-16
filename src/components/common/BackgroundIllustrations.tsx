import React from 'react';
import { useRouter } from '../../lib/router.tsx';

/* ─────────────────────────────────────────────────────────────────────────
 *  SERVA – Premium Background Illustrations
 *  • Gradient blobs + geometric shapes + subtle patterns
 *  • position: absolute → scrolls WITH page content
 *  • pointer-events-none, aria-hidden, z-0
 * ───────────────────────────────────────────────────────────────────────── */

export function BackgroundIllustrations() {
  const { pathname } = useRouter();

  let theme: 'home' | 'home-services' | 'contractors' | 'events' | 'agriculture' | 'moving' | 'general' = 'home';

  if (pathname === '/') theme = 'home';
  else if (pathname.startsWith('/home-services')) theme = 'home-services';
  else if (pathname.startsWith('/contractors')) theme = 'contractors';
  else if (pathname.startsWith('/events')) theme = 'events';
  else if (pathname.startsWith('/agriculture')) theme = 'agriculture';
  else if (pathname.startsWith('/moving')) theme = 'moving';
  else theme = 'general';

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 w-full overflow-hidden pointer-events-none select-none z-0"
      style={{ minHeight: '100%' }}
    >
      {/* ── Universal subtle dot mesh ── */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.18]"
        xmlns="http://www.w3.org/2000/svg"
        style={{ minHeight: '100%' }}
      >
        <defs>
          <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="#0B5FD9" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* ═══════════════════════════════════════════════════════════
       *  HOME PAGE  ( / )
       *  Multi-service montage: bold blobs + service icons
       * ═══════════════════════════════════════════════════════════ */}
      {theme === 'home' && (
        <>
          {/* TOP RIGHT — large indigo blob */}
          <div className="absolute -top-32 -right-40 w-[640px] h-[640px] rounded-full opacity-[0.13] blur-3xl hidden lg:block"
            style={{ background: 'radial-gradient(circle, #3B82F6 0%, #0B5FD9 50%, transparent 80%)' }} />
          {/* TOP LEFT — teal accent */}
          <div className="absolute -top-16 -left-32 w-[400px] h-[400px] rounded-full opacity-[0.10] blur-3xl hidden md:block"
            style={{ background: 'radial-gradient(circle, #06B6D4 0%, #0284C7 60%, transparent 85%)' }} />

          {/* MID RIGHT — purple blob */}
          <div className="absolute top-[55%] -right-24 w-[480px] h-[480px] rounded-full opacity-[0.11] blur-3xl hidden lg:block"
            style={{ background: 'radial-gradient(circle, #A855F7 0%, #7C3AED 55%, transparent 80%)' }} />
          {/* MID LEFT — green blob */}
          <div className="absolute top-[45%] -left-20 w-[420px] h-[420px] rounded-full opacity-[0.09] blur-3xl hidden md:block"
            style={{ background: 'radial-gradient(circle, #22C55E 0%, #16A34A 60%, transparent 85%)' }} />

          {/* BOTTOM — amber glow */}
          <div className="absolute bottom-[-100px] right-[20%] w-[500px] h-[300px] rounded-full opacity-[0.08] blur-3xl hidden lg:block"
            style={{ background: 'radial-gradient(circle, #F59E0B 0%, #D97706 70%, transparent 100%)' }} />

          {/* Decorative geometric shapes */}
          <svg className="absolute top-16 right-[8%] w-[260px] h-[260px] opacity-[0.22] hidden xl:block" viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Hexagon */}
            <polygon points="130,10 220,55 220,145 130,190 40,145 40,55" stroke="#0B5FD9" strokeWidth="1.5" fill="none" strokeDasharray="6 4"/>
            <polygon points="130,38 198,70 198,135 130,167 62,135 62,70" stroke="#0B5FD9" strokeWidth="1" fill="#EFF6FF" fillOpacity="0.4"/>
            <circle cx="130" cy="100" r="30" fill="#0B5FD9" fillOpacity="0.08" stroke="#0B5FD9" strokeWidth="1.5"/>
            {/* House icon */}
            <polygon points="130,65 158,88 102,88" fill="#0B5FD9" fillOpacity="0.3"/>
            <rect x="112" y="88" width="36" height="28" rx="2" fill="#0B5FD9" fillOpacity="0.15" stroke="#0B5FD9" strokeWidth="1.2"/>
            <rect x="124" y="98" width="12" height="18" rx="1" fill="#0B5FD9" fillOpacity="0.3"/>
          </svg>

          <svg className="absolute top-[38%] left-[5%] w-[200px] h-[200px] opacity-[0.20] hidden xl:block" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Spinning rings */}
            <circle cx="100" cy="100" r="85" stroke="#16A34A" strokeWidth="1.2" strokeDasharray="8 5"/>
            <circle cx="100" cy="100" r="62" stroke="#16A34A" strokeWidth="1" strokeDasharray="5 7" opacity="0.7"/>
            <circle cx="100" cy="100" r="38" stroke="#22C55E" strokeWidth="1.5" fill="#F0FDF4" fillOpacity="0.3"/>
            {/* Wheat leaf */}
            <path d="M100,135 Q100,95 95,65" stroke="#16A34A" strokeWidth="2.5"/>
            <ellipse cx="93" cy="75" rx="9" ry="5" transform="rotate(-30 93 75)" fill="#86EFAC" stroke="#16A34A" strokeWidth="1.2"/>
            <ellipse cx="104" cy="82" rx="9" ry="5" transform="rotate(30 104 82)" fill="#86EFAC" stroke="#16A34A" strokeWidth="1.2"/>
          </svg>

          <svg className="absolute bottom-[25%] right-[6%] w-[180px] h-[180px] opacity-[0.22] hidden lg:block" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Star burst */}
            {[0,45,90,135].map(a => (
              <line key={a} x1="90" y1="90" x2={90 + 75*Math.cos(a*Math.PI/180)} y2={90 + 75*Math.sin(a*Math.PI/180)} stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="4 3"/>
            ))}
            <circle cx="90" cy="90" r="32" fill="#FEF3C7" fillOpacity="0.5" stroke="#F59E0B" strokeWidth="1.5"/>
            {/* DJ vinyl */}
            <circle cx="90" cy="90" r="22" stroke="#7C3AED" strokeWidth="1" strokeDasharray="3 2"/>
            <circle cx="90" cy="90" r="8" fill="#7C3AED" fillOpacity="0.25"/>
            <circle cx="90" cy="90" r="3" fill="#7C3AED"/>
          </svg>

          {/* Floating dots accent */}
          <svg className="absolute top-[20%] left-[18%] opacity-[0.18] hidden md:block" width="120" height="120" viewBox="0 0 120 120">
            {[0,1,2,3,4].map(r => [0,1,2,3,4].map(c => (
              <circle key={`${r}${c}`} cx={12+c*24} cy={12+r*24} r="3.5" fill="#0B5FD9"/>
            )))}
          </svg>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
       *  HOME SERVICES  ( /home-services )
       *  Sky blue + warm tones, tools & cleaning
       * ═══════════════════════════════════════════════════════════ */}
      {theme === 'home-services' && (
        <>
          <div className="absolute -top-20 -right-32 w-[560px] h-[560px] rounded-full opacity-[0.12] blur-3xl hidden lg:block"
            style={{ background: 'radial-gradient(circle, #38BDF8 0%, #0284C7 55%, transparent 80%)' }} />
          <div className="absolute top-[30%] -left-24 w-[400px] h-[400px] rounded-full opacity-[0.10] blur-3xl hidden md:block"
            style={{ background: 'radial-gradient(circle, #FDE68A 0%, #F59E0B 60%, transparent 85%)' }} />
          <div className="absolute bottom-[-80px] -right-16 w-[440px] h-[440px] rounded-full opacity-[0.09] blur-3xl hidden lg:block"
            style={{ background: 'radial-gradient(circle, #BAE6FD 0%, #38BDF8 70%, transparent 100%)' }} />

          {/* Top right: wrench in circle */}
          <svg className="absolute top-20 right-[7%] w-[240px] h-[240px] opacity-[0.25] hidden xl:block" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="120" cy="120" r="100" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="7 5" fill="#EFF6FF" fillOpacity="0.3"/>
            <circle cx="120" cy="120" r="72" stroke="#38BDF8" strokeWidth="1" fill="none" strokeDasharray="4 6"/>
            {/* Wrench */}
            <g transform="translate(85,85) rotate(45)">
              <rect x="0" y="-8" width="80" height="16" rx="4" fill="#BAE6FD" stroke="#0284C7" strokeWidth="2"/>
              <circle cx="72" cy="0" r="5" fill="#0284C7"/>
              <path d="M0,-16 L-14,-16 L-20,-8 L-20,8 L-14,16 L0,16" stroke="#0A1F5C" strokeWidth="2.5" fill="none"/>
              <circle cx="-20" cy="0" r="6" stroke="#0A1F5C" strokeWidth="2" fill="none"/>
            </g>
            {/* Bubbles */}
            <circle cx="60" cy="60" r="12" stroke="#38BDF8" strokeWidth="1.5" fill="#BAE6FD" fillOpacity="0.3"/>
            <circle cx="175" cy="175" r="9" stroke="#38BDF8" strokeWidth="1.5" fill="#BAE6FD" fillOpacity="0.3"/>
            <circle cx="168" cy="62" r="7" stroke="#0284C7" strokeWidth="1.5" fill="#BAE6FD" fillOpacity="0.2"/>
          </svg>

          {/* Left: chef toque */}
          <svg className="absolute top-[42%] left-[4%] w-[200px] h-[200px] opacity-[0.22] hidden xl:block" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="88" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="6 5" fill="#FFFBEB" fillOpacity="0.25"/>
            {/* Chef hat */}
            <path d="M68,105 C52,105 40,88 52,70 C46,52 62,36 82,42 C90,26 112,26 120,42 C140,36 156,52 150,70 C162,88 150,105 134,105 Z"
              stroke="#D97706" strokeWidth="2" fill="#FEF3C7" fillOpacity="0.6"/>
            <rect x="62" y="105" width="78" height="20" rx="3" stroke="#D97706" strokeWidth="1.8" fill="#FDE68A" fillOpacity="0.5"/>
            {/* Steam */}
            <path d="M85,130 Q90,118 85,108" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="2 3"/>
            <path d="M101,130 Q106,118 101,108" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="2 3"/>
            <path d="M117,130 Q122,118 117,108" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="2 3"/>
          </svg>

          {/* Right lower: paint roller */}
          <svg className="absolute bottom-[22%] right-[5%] w-[200px] h-[200px] opacity-[0.22] hidden lg:block" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="85" stroke="#0284C7" strokeWidth="1" strokeDasharray="5 7" fill="none"/>
            {/* Paint roller body */}
            <rect x="45" y="60" width="90" height="32" rx="8" fill="#BAE6FD" stroke="#0284C7" strokeWidth="2"/>
            <rect x="40" y="60" width="12" height="32" rx="4" fill="#0284C7" fillOpacity="0.3" stroke="#0284C7" strokeWidth="1.5"/>
            <rect x="148" y="60" width="12" height="32" rx="4" fill="#0284C7" fillOpacity="0.3" stroke="#0284C7" strokeWidth="1.5"/>
            {/* Handle */}
            <path d="M100,92 L100,135 L130,135" stroke="#0A1F5C" strokeWidth="3" fill="none"/>
            <rect x="125" y="135" width="10" height="28" rx="3" fill="#0A1F5C"/>
            {/* Paint stroke */}
            <path d="M40,108 C55,105 80,112 100,108 C120,104 145,112 160,108" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" fill="none"/>
          </svg>

          {/* Dot cluster */}
          <svg className="absolute top-[65%] left-[15%] opacity-[0.15] hidden md:block" width="100" height="100" viewBox="0 0 100 100">
            {[0,1,2,3].map(r => [0,1,2,3].map(c => (
              <circle key={`${r}${c}`} cx={10+c*26} cy={10+r*26} r="4" fill="#0284C7"/>
            )))}
          </svg>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
       *  CONTRACTORS  ( /contractors )
       *  Deep navy + amber/orange, industrial precision
       * ═══════════════════════════════════════════════════════════ */}
      {theme === 'contractors' && (
        <>
          <div className="absolute -top-24 -right-36 w-[600px] h-[600px] rounded-full opacity-[0.11] blur-3xl hidden lg:block"
            style={{ background: 'radial-gradient(circle, #FCD34D 0%, #D97706 50%, transparent 80%)' }} />
          <div className="absolute top-[40%] -left-28 w-[450px] h-[450px] rounded-full opacity-[0.10] blur-3xl hidden md:block"
            style={{ background: 'radial-gradient(circle, #93C5FD 0%, #0B5FD9 60%, transparent 85%)' }} />
          <div className="absolute bottom-[-60px] right-[25%] w-[400px] h-[300px] rounded-full opacity-[0.08] blur-3xl hidden lg:block"
            style={{ background: 'radial-gradient(circle, #FEF3C7 0%, #F59E0B 80%, transparent 100%)' }} />

          {/* Tower Crane — top right */}
          <svg className="absolute top-12 right-[6%] w-[220px] h-[300px] opacity-[0.26] hidden xl:block" viewBox="0 0 220 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Mast */}
            <line x1="90" y1="20" x2="90" y2="295" stroke="#0A1F5C" strokeWidth="4"/>
            <line x1="102" y1="40" x2="102" y2="295" stroke="#0A1F5C" strokeWidth="2" strokeDasharray="6 5"/>
            {/* Lattice braces */}
            {[60,100,140,180,220,260].map(y => (
              <line key={y} x1="90" y1={y} x2="102" y2={y+20} stroke="#0A1F5C" strokeWidth="1.2"/>
            ))}
            {/* Jib */}
            <line x1="10" y1="30" x2="210" y2="30" stroke="#D97706" strokeWidth="3.5"/>
            <line x1="90" y1="5" x2="210" y2="30" stroke="#D97706" strokeWidth="1.8" strokeDasharray="5 4"/>
            <line x1="90" y1="5" x2="10" y2="30" stroke="#D97706" strokeWidth="2.5"/>
            <line x1="90" y1="5" x2="90" y2="30" strokeWidth="3" stroke="#D97706"/>
            {/* Counterweight */}
            <rect x="2" y="22" width="22" height="16" rx="2" fill="#D97706" fillOpacity="0.4" stroke="#D97706" strokeWidth="1.5"/>
            {/* Trolley + rope */}
            <rect x="160" y="27" width="20" height="10" rx="2" fill="#0B5FD9"/>
            <line x1="170" y1="37" x2="170" y2="140" stroke="#0B5FD9" strokeWidth="1.8" strokeDasharray="4 3"/>
            {/* Hook */}
            <path d="M170,140 C170,152 158,158 164,166 C168,172 178,166 178,156" stroke="#0A1F5C" strokeWidth="2.5" fill="none"/>
            {/* Load */}
            <rect x="150" y="166" width="40" height="30" rx="3" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.8"/>
            <line x1="158" y1="166" x2="162" y2="196" stroke="#D97706" strokeWidth="1.2"/>
            <line x1="166" y1="166" x2="170" y2="196" stroke="#D97706" strokeWidth="1.2"/>
          </svg>

          {/* Hard hat + blueprint — left */}
          <svg className="absolute top-[35%] left-[4%] w-[220px] h-[220px] opacity-[0.24] hidden xl:block" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Blueprint grid */}
            <rect x="10" y="10" width="200" height="200" rx="8" fill="#EFF6FF" fillOpacity="0.5" stroke="#0B5FD9" strokeWidth="1.5"/>
            {[40,70,100,130,160].map(y => <line key={`h${y}`} x1="10" y1={y} x2="210" y2={y} stroke="#93C5FD" strokeWidth="0.8"/>)}
            {[40,70,100,130,160,190].map(x => <line key={`v${x}`} x1={x} y1="10" x2={x} y2="210" stroke="#93C5FD" strokeWidth="0.8"/>)}
            {/* House outline on blueprint */}
            <polygon points="110,50 150,80 70,80" stroke="#0B5FD9" strokeWidth="2" fill="none"/>
            <rect x="80" y="80" width="60" height="45" stroke="#0B5FD9" strokeWidth="2" fill="none"/>
            <rect x="97" y="100" width="18" height="25" stroke="#0B5FD9" strokeWidth="1.5" fill="none"/>
            {/* Measurement lines */}
            <line x1="68" y1="130" x2="152" y2="130" stroke="#D97706" strokeWidth="1.2"/>
            <line x1="68" y1="126" x2="68" y2="134" stroke="#D97706" strokeWidth="1.2"/>
            <line x1="152" y1="126" x2="152" y2="134" stroke="#D97706" strokeWidth="1.2"/>
            {/* Hard hat overlay */}
            <path d="M68,185 C68,162 82,150 110,150 C138,150 152,162 152,185 L160,188 L60,188 Z" fill="#FCD34D" stroke="#D97706" strokeWidth="2"/>
            <line x1="60" y1="188" x2="160" y2="188" stroke="#D97706" strokeWidth="3"/>
            <rect x="102" y="142" width="16" height="18" rx="2" fill="#D97706"/>
          </svg>

          {/* Brick pattern — bottom right */}
          <svg className="absolute bottom-[20%] right-[5%] w-[200px] h-[160px] opacity-[0.22] hidden lg:block" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            {[0,1,2,3].map(row =>
              [0,1,2].map(col => {
                const offset = row % 2 === 0 ? 0 : 32;
                const x = offset + col * 64;
                const y = row * 36;
                if (x + 58 > 200) return null;
                return <rect key={`${row}${col}`} x={x+1} y={y+1} width="58" height="30" rx="3" fill="#FEE2E2" stroke="#DC2626" strokeWidth="1.5" fillOpacity="0.6"/>;
              })
            )}
            {/* Trowel */}
            <g transform="translate(130,100)">
              <polygon points="0,0 36,18 0,36 -18,18" fill="#E2E8F0" stroke="#0A1F5C" strokeWidth="2"/>
              <line x1="-18" y1="18" x2="-40" y2="18" stroke="#0A1F5C" strokeWidth="2.5"/>
              <rect x="-52" y="14" width="14" height="8" rx="2" fill="#0A1F5C"/>
            </g>
          </svg>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
       *  EVENTS  ( /events )
       *  Vibrant purple + gold, celebration & music
       * ═══════════════════════════════════════════════════════════ */}
      {theme === 'events' && (
        <>
          <div className="absolute -top-28 -right-32 w-[640px] h-[640px] rounded-full opacity-[0.14] blur-3xl hidden lg:block"
            style={{ background: 'radial-gradient(circle, #C084FC 0%, #7C3AED 50%, transparent 80%)' }} />
          <div className="absolute top-[35%] -left-24 w-[500px] h-[500px] rounded-full opacity-[0.12] blur-3xl hidden md:block"
            style={{ background: 'radial-gradient(circle, #FCD34D 0%, #F59E0B 60%, transparent 85%)' }} />
          <div className="absolute bottom-[-80px] right-[30%] w-[460px] h-[320px] rounded-full opacity-[0.10] blur-3xl hidden lg:block"
            style={{ background: 'radial-gradient(circle, #F9A8D4 0%, #EC4899 70%, transparent 100%)' }} />

          {/* DJ Turntable — top right */}
          <svg className="absolute top-16 right-[5%] w-[260px] h-[220px] opacity-[0.26] hidden xl:block" viewBox="0 0 260 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Deck base */}
            <rect x="15" y="30" width="230" height="175" rx="14" fill="#FAF5FF" stroke="#7C3AED" strokeWidth="2.2" fillOpacity="0.6"/>
            {/* Vinyl */}
            <circle cx="110" cy="118" r="72" stroke="#7C3AED" strokeWidth="2.2" fill="#EDE9FE"/>
            <circle cx="110" cy="118" r="56" stroke="#7C3AED" strokeWidth="1" strokeDasharray="5 4" fill="none"/>
            <circle cx="110" cy="118" r="38" stroke="#A855F7" strokeWidth="1" strokeDasharray="4 3" fill="none"/>
            <circle cx="110" cy="118" r="20" fill="#7C3AED" fillOpacity="0.25" stroke="#7C3AED" strokeWidth="1.5"/>
            <circle cx="110" cy="118" r="6" fill="#0A1F5C"/>
            {/* Tone arm */}
            <circle cx="200" cy="52" r="10" fill="#7C3AED" fillOpacity="0.2" stroke="#7C3AED" strokeWidth="2"/>
            <line x1="200" y1="62" x2="200" y2="96" stroke="#7C3AED" strokeWidth="3"/>
            <line x1="200" y1="96" x2="150" y2="128" stroke="#7C3AED" strokeWidth="2.2"/>
            <rect x="144" y="126" width="10" height="6" rx="1" fill="#7C3AED"/>
            {/* Fader */}
            <line x1="220" y1="100" x2="220" y2="175" stroke="#A855F7" strokeWidth="2.5"/>
            <rect x="213" y="130" width="14" height="8" rx="2" fill="#7C3AED"/>
            {/* Knobs */}
            <circle cx="225" cy="68" r="7" fill="#7C3AED" fillOpacity="0.4" stroke="#7C3AED" strokeWidth="1.5"/>
            <circle cx="244" cy="68" r="7" fill="#7C3AED" fillOpacity="0.4" stroke="#7C3AED" strokeWidth="1.5"/>
          </svg>

          {/* Spotlights — top left */}
          <svg className="absolute top-20 left-[4%] w-[200px] h-[260px] opacity-[0.24] hidden xl:block" viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Spotlight 1 */}
            <ellipse cx="45" cy="22" rx="8" ry="14" fill="#F59E0B" fillOpacity="0.5" stroke="#D97706" strokeWidth="2"/>
            <polygon points="45,36 20,220 70,220" fill="#FCD34D" fillOpacity="0.08" stroke="#D97706" strokeWidth="0.5"/>
            {/* Spotlight 2 */}
            <ellipse cx="130" cy="18" rx="8" ry="14" fill="#C084FC" fillOpacity="0.5" stroke="#7C3AED" strokeWidth="2"/>
            <polygon points="130,32 95,220 165,220" fill="#C084FC" fillOpacity="0.06" stroke="#7C3AED" strokeWidth="0.5"/>
            {/* Stage base */}
            <line x1="10" y1="220" x2="190" y2="220" stroke="#0A1F5C" strokeWidth="2.5"/>
            {/* Equalizer bars */}
            {[0,12,24,36,48,60,72].map((x, i) => {
              const h = [60,90,45,110,70,100,55][i];
              return <rect key={i} x={10+x} y={220-h} width="8" height={h} rx="2" fill="#7C3AED" fillOpacity={0.35+i*0.04}/>;
            })}
          </svg>

          {/* Musical notes + champagne — bottom right */}
          <svg className="absolute bottom-[18%] right-[5%] w-[200px] h-[200px] opacity-[0.26] hidden lg:block" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Treble clef */}
            <path d="M75,165 C62,165 50,152 56,135 C64,112 95,95 88,55 C82,22 52,22 64,72 C76,118 32,118 44,152 C50,170 70,178 82,170" stroke="#7C3AED" strokeWidth="2.8" fill="none"/>
            {/* Champagne flutes */}
            <g transform="translate(110,30)">
              <polygon points="30,10 42,55 18,55 6,10" stroke="#F59E0B" strokeWidth="1.8" fill="#FEF3C7" fillOpacity="0.5"/>
              <line x1="24" y1="55" x2="24" y2="85" stroke="#F59E0B" strokeWidth="2"/>
              <line x1="14" y1="85" x2="34" y2="85" stroke="#F59E0B" strokeWidth="2"/>
              {/* Bubbles */}
              <circle cx="24" cy="40" r="3" fill="#F59E0B" opacity="0.5"/>
              <circle cx="28" cy="30" r="2" fill="#F59E0B" opacity="0.5"/>
              <circle cx="20" cy="22" r="2.5" fill="#F59E0B" opacity="0.5"/>
            </g>
            {/* Note pair */}
            <g transform="translate(110,120)">
              <ellipse cx="12" cy="30" rx="8" ry="6" transform="rotate(-15 12 30)" fill="#7C3AED" fillOpacity="0.7"/>
              <ellipse cx="42" cy="22" rx="8" ry="6" transform="rotate(-15 42 22)" fill="#7C3AED" fillOpacity="0.7"/>
              <line x1="19" y1="27" x2="19" y2="-2" stroke="#7C3AED" strokeWidth="2.5"/>
              <line x1="49" y1="19" x2="49" y2="-10" stroke="#7C3AED" strokeWidth="2.5"/>
              <line x1="19" y1="-2" x2="49" y2="-10" stroke="#7C3AED" strokeWidth="3.5"/>
            </g>
          </svg>

          {/* Confetti scatter */}
          <svg className="absolute top-[55%] left-[8%] opacity-[0.22] hidden md:block" width="140" height="120" viewBox="0 0 140 120">
            {[
              {x:10,y:20,r:4,c:"#7C3AED"},{x:30,y:60,r:3,c:"#F59E0B"},{x:55,y:15,r:5,c:"#EC4899"},
              {x:75,y:50,r:3,c:"#7C3AED"},{x:95,y:28,r:4,c:"#FCD34D"},{x:115,y:70,r:3,c:"#A855F7"},
              {x:20,y:90,r:4,c:"#F59E0B"},{x:50,y:100,r:3,c:"#EC4899"},{x:80,y:85,r:5,c:"#7C3AED"},
              {x:110,y:100,r:3,c:"#FCD34D"},{x:40,y:35,r:3,c:"#EC4899"},{x:130,y:40,r:4,c:"#7C3AED"},
            ].map(({x,y,r,c},i) => (
              <rect key={i} x={x} y={y} width={r*2} height={r*2} rx={r/2} fill={c} transform={`rotate(${i*25},${x+r},${y+r})`}/>
            ))}
          </svg>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
       *  AGRICULTURE  ( /agriculture )
       *  Fresh green + golden, nature & farming
       * ═══════════════════════════════════════════════════════════ */}
      {theme === 'agriculture' && (
        <>
          <div className="absolute -top-20 -right-28 w-[580px] h-[580px] rounded-full opacity-[0.13] blur-3xl hidden lg:block"
            style={{ background: 'radial-gradient(circle, #4ADE80 0%, #16A34A 55%, transparent 80%)' }} />
          <div className="absolute top-[40%] -left-20 w-[440px] h-[440px] rounded-full opacity-[0.11] blur-3xl hidden md:block"
            style={{ background: 'radial-gradient(circle, #FCD34D 0%, #D97706 65%, transparent 85%)' }} />
          <div className="absolute bottom-[-70px] right-[20%] w-[500px] h-[300px] rounded-full opacity-[0.09] blur-3xl hidden lg:block"
            style={{ background: 'radial-gradient(circle, #A7F3D0 0%, #34D399 80%, transparent 100%)' }} />

          {/* Drone — top right */}
          <svg className="absolute top-14 right-[5%] w-[260px] h-[200px] opacity-[0.26] hidden xl:block" viewBox="0 0 260 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Body */}
            <ellipse cx="130" cy="90" rx="38" ry="20" stroke="#16A34A" strokeWidth="2.5" fill="#DCFCE7" fillOpacity="0.6"/>
            <circle cx="130" cy="90" r="9" fill="#16A34A"/>
            {/* 4 arms */}
            <line x1="96" y1="77" x2="38" y2="42" stroke="#16A34A" strokeWidth="3"/>
            <line x1="164" y1="77" x2="222" y2="42" stroke="#16A34A" strokeWidth="3"/>
            <line x1="96" y1="103" x2="38" y2="138" stroke="#16A34A" strokeWidth="3"/>
            <line x1="164" y1="103" x2="222" y2="138" stroke="#16A34A" strokeWidth="3"/>
            {/* Propellers */}
            <ellipse cx="38" cy="42" rx="30" ry="6" stroke="#16A34A" strokeWidth="1.5" fill="#A7F3D0" fillOpacity="0.4" strokeDasharray="4 2"/>
            <ellipse cx="222" cy="42" rx="30" ry="6" stroke="#16A34A" strokeWidth="1.5" fill="#A7F3D0" fillOpacity="0.4" strokeDasharray="4 2"/>
            <ellipse cx="38" cy="138" rx="30" ry="6" stroke="#16A34A" strokeWidth="1.5" fill="#A7F3D0" fillOpacity="0.4" strokeDasharray="4 2"/>
            <ellipse cx="222" cy="138" rx="30" ry="6" stroke="#16A34A" strokeWidth="1.5" fill="#A7F3D0" fillOpacity="0.4" strokeDasharray="4 2"/>
            {/* Spray drops */}
            {[108,120,132,144,156].map((x,i) => (
              <circle key={i} cx={x} cy={130+i*5} r="2.5" fill="#16A34A" opacity={0.6-i*0.08}/>
            ))}
          </svg>

          {/* Wheat stalks — left */}
          <svg className="absolute top-[30%] left-[4%] w-[200px] h-[280px] opacity-[0.26] hidden xl:block" viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Sun arc */}
            <path d="M20,180 A80,80 0 0,1 180,180" stroke="#F59E0B" strokeWidth="2.2" strokeDasharray="6 4" fill="none"/>
            <line x1="100" y1="90" x2="100" y2="72" stroke="#F59E0B" strokeWidth="2"/>
            <line x1="134" y1="104" x2="148" y2="90" stroke="#F59E0B" strokeWidth="2"/>
            <line x1="66" y1="104" x2="52" y2="90" stroke="#F59E0B" strokeWidth="2"/>
            {/* Stem 1 */}
            <path d="M75,275 Q72,210 78,140" stroke="#16A34A" strokeWidth="3"/>
            {[150,160,172,184,196].map((y,i) => (
              <React.Fragment key={y}>
                <ellipse cx={68} cy={y} rx="12" ry="6" transform={`rotate(-35 68 ${y})`} fill="#A7F3D0" stroke="#16A34A" strokeWidth="1.5"/>
                <ellipse cx={88} cy={y+6} rx="12" ry="6" transform={`rotate(35 88 ${y+6})`} fill="#A7F3D0" stroke="#16A34A" strokeWidth="1.5"/>
              </React.Fragment>
            ))}
            {/* Stem 2 */}
            <path d="M120,275 Q118,205 124,135" stroke="#16A34A" strokeWidth="2.5" opacity="0.7"/>
            {[142,155,168,180].map((y) => (
              <React.Fragment key={y}>
                <ellipse cx={112} cy={y} rx="10" ry="5" transform={`rotate(-30 112 ${y})`} fill="#DCFCE7" stroke="#16A34A" strokeWidth="1.2"/>
                <ellipse cx={130} cy={y+5} rx="10" ry="5" transform={`rotate(30 130 ${y+5})`} fill="#DCFCE7" stroke="#16A34A" strokeWidth="1.2"/>
              </React.Fragment>
            ))}
          </svg>

          {/* Tractor — bottom right */}
          <svg className="absolute bottom-[20%] right-[4%] w-[220px] h-[180px] opacity-[0.24] hidden lg:block" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Big rear wheel */}
            <circle cx="70" cy="120" r="52" stroke="#16A34A" strokeWidth="3" fill="#DCFCE7" fillOpacity="0.4"/>
            <circle cx="70" cy="120" r="28" stroke="#16A34A" strokeWidth="2" fill="none"/>
            {/* Front wheel */}
            <circle cx="175" cy="135" r="30" stroke="#16A34A" strokeWidth="2.5" fill="#DCFCE7" fillOpacity="0.4"/>
            <circle cx="175" cy="135" r="15" stroke="#16A34A" strokeWidth="1.5" fill="none"/>
            {/* Body */}
            <polygon points="70,78 125,78 160,88 195,88 195,135 70,120" stroke="#16A34A" strokeWidth="2.2" fill="#F0FDF4" fillOpacity="0.7"/>
            {/* Exhaust pipe */}
            <line x1="150" y1="82" x2="150" y2="48" stroke="#16A34A" strokeWidth="3"/>
            <path d="M150,48 Q150,38 160,38" stroke="#16A34A" strokeWidth="2.5" fill="none"/>
            {/* Cabin */}
            <rect x="90" y="58" width="55" height="40" rx="4" stroke="#16A34A" strokeWidth="1.8" fill="#DCFCE7" fillOpacity="0.5"/>
            {/* Ground lines */}
            <path d="M15,168 C60,162 130,168 215,172" stroke="#16A34A" strokeWidth="1.5" strokeDasharray="6 4" fill="none"/>
          </svg>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
       *  MOVING & SHIFTING  ( /moving )
       *  Warm orange + blue, logistics & transit
       * ═══════════════════════════════════════════════════════════ */}
      {theme === 'moving' && (
        <>
          <div className="absolute -top-24 -right-32 w-[600px] h-[600px] rounded-full opacity-[0.12] blur-3xl hidden lg:block"
            style={{ background: 'radial-gradient(circle, #93C5FD 0%, #0B5FD9 55%, transparent 80%)' }} />
          <div className="absolute top-[40%] -left-20 w-[440px] h-[440px] rounded-full opacity-[0.10] blur-3xl hidden md:block"
            style={{ background: 'radial-gradient(circle, #FED7AA 0%, #F97316 60%, transparent 85%)' }} />
          <div className="absolute bottom-[-80px] right-[22%] w-[480px] h-[300px] rounded-full opacity-[0.09] blur-3xl hidden lg:block"
            style={{ background: 'radial-gradient(circle, #BFDBFE 0%, #60A5FA 80%, transparent 100%)' }} />

          {/* 3D Boxes — top right */}
          <svg className="absolute top-16 right-[5%] w-[240px] h-[260px] opacity-[0.26] hidden xl:block" viewBox="0 0 240 260" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Big bottom box */}
            <polygon points="120,30 190,65 120,100 50,65" fill="#FEF3C7" stroke="#D97706" strokeWidth="2"/>
            <polygon points="50,65 120,100 120,180 50,145" fill="#FFFBEB" stroke="#D97706" strokeWidth="2"/>
            <polygon points="120,100 190,65 190,145 120,180" fill="#FDE68A" stroke="#D97706" strokeWidth="2"/>
            {/* Tape */}
            <line x1="84" y1="47" x2="156" y2="82" stroke="#0B5FD9" strokeWidth="2.5"/>
            <line x1="120" y1="100" x2="120" y2="150" stroke="#0B5FD9" strokeWidth="2.5"/>
            {/* Middle box */}
            <polygon points="120,195 170,218 120,240 70,218" fill="#DBEAFE" stroke="#0B5FD9" strokeWidth="1.8"/>
            <polygon points="70,218 120,240 120,260 70,240" fill="#EFF6FF" stroke="#0B5FD9" strokeWidth="1.8"/>
            <polygon points="120,240 170,218 170,240 120,260" fill="#BFDBFE" stroke="#0B5FD9" strokeWidth="1.8"/>
            {/* Fragile label on middle box */}
            <text x="80" y="232" fontSize="9" fill="#0B5FD9" fontFamily="system-ui" opacity="0.6">FRAGILE</text>
          </svg>

          {/* Moving van — left */}
          <svg className="absolute top-[35%] left-[3%] w-[260px] h-[180px] opacity-[0.24] hidden xl:block" viewBox="0 0 260 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Cargo body */}
            <rect x="15" y="40" width="150" height="100" rx="6" fill="#EFF6FF" stroke="#0B5FD9" strokeWidth="2.5"/>
            {/* Cab */}
            <path d="M165,68 L205,68 L225,96 L225,140 L165,140 Z" fill="#DBEAFE" stroke="#0B5FD9" strokeWidth="2.5"/>
            {/* Windshield */}
            <polygon points="172,74 200,74 212,94 172,94" fill="white" stroke="#0B5FD9" strokeWidth="1.5"/>
            {/* Wheels */}
            <circle cx="60" cy="140" r="22" fill="#1E293B" stroke="#0B5FD9" strokeWidth="2.5"/>
            <circle cx="60" cy="140" r="9" fill="white"/>
            <circle cx="190" cy="140" r="22" fill="#1E293B" stroke="#0B5FD9" strokeWidth="2.5"/>
            <circle cx="190" cy="140" r="9" fill="white"/>
            {/* Door lines */}
            <line x1="90" y1="40" x2="90" y2="140" stroke="#93C5FD" strokeWidth="1.5"/>
            <line x1="130" y1="40" x2="130" y2="140" stroke="#93C5FD" strokeWidth="1.5"/>
            {/* Speed lines */}
            <line x1="-5" y1="58" x2="10" y2="58" stroke="#0B5FD9" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="-15" y1="78" x2="8" y2="78" stroke="#0B5FD9" strokeWidth="2" strokeLinecap="round"/>
            <line x1="-5" y1="98" x2="10" y2="98" stroke="#0B5FD9" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>

          {/* Route path + pins — bottom right */}
          <svg className="absolute bottom-[18%] right-[5%] w-[200px] h-[180px] opacity-[0.26] hidden lg:block" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Path */}
            <path d="M20,140 C60,100 100,160 160,80" stroke="#0B5FD9" strokeWidth="2.5" strokeDasharray="7 5" fill="none"/>
            {/* From pin */}
            <path d="M20,140 C10,124 10,112 20,106 C30,112 30,124 20,140 Z" fill="#0B5FD9"/>
            <circle cx="20" cy="112" r="5" fill="white"/>
            {/* To pin */}
            <path d="M160,80 C150,64 150,52 160,46 C170,52 170,64 160,80 Z" fill="#16A34A"/>
            <circle cx="160" cy="52" r="5" fill="white"/>
            {/* Midpoint truck */}
            <g transform="translate(85, 112)">
              <rect x="-14" y="-8" width="20" height="13" rx="2" fill="#EFF6FF" stroke="#0B5FD9" strokeWidth="1.5"/>
              <path d="M6,-4 L18,-4 L22,2 L22,8 L6,8 Z" fill="#DBEAFE" stroke="#0B5FD9" strokeWidth="1.5"/>
              <circle cx="-6" cy="8" r="4" fill="#1E293B" stroke="#0B5FD9" strokeWidth="1"/>
              <circle cx="14" cy="8" r="4" fill="#1E293B" stroke="#0B5FD9" strokeWidth="1"/>
            </g>
          </svg>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
       *  GENERAL  ( login, profile, bookings, support, etc. )
       *  Trust, verification, clean & minimal
       * ═══════════════════════════════════════════════════════════ */}
      {theme === 'general' && (
        <>
          <div className="absolute -top-20 -right-28 w-[520px] h-[520px] rounded-full opacity-[0.11] blur-3xl hidden lg:block"
            style={{ background: 'radial-gradient(circle, #60A5FA 0%, #0B5FD9 55%, transparent 80%)' }} />
          <div className="absolute top-[45%] -left-16 w-[380px] h-[380px] rounded-full opacity-[0.09] blur-3xl hidden md:block"
            style={{ background: 'radial-gradient(circle, #A7F3D0 0%, #16A34A 65%, transparent 85%)' }} />

          {/* Shield + check — top right */}
          <svg className="absolute top-20 right-[7%] w-[220px] h-[240px] opacity-[0.26] hidden xl:block" viewBox="0 0 220 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer glow ring */}
            <circle cx="110" cy="110" r="100" stroke="#0B5FD9" strokeWidth="1" strokeDasharray="8 6" fill="none"/>
            <circle cx="110" cy="110" r="78" stroke="#0B5FD9" strokeWidth="0.8" fill="#EFF6FF" fillOpacity="0.3"/>
            {/* Shield */}
            <path d="M110,42 L162,62 C162,118 110,170 110,170 C110,170 58,118 58,62 Z" fill="#DBEAFE" fillOpacity="0.6" stroke="#0B5FD9" strokeWidth="2.5"/>
            {/* Inner shield */}
            <path d="M110,62 L148,76 C148,116 110,148 110,148 C110,148 72,116 72,76 Z" fill="#EFF6FF" fillOpacity="0.4" stroke="#0B5FD9" strokeWidth="1.5"/>
            {/* Green checkmark */}
            <polyline points="85,108 102,126 138,88" stroke="#16A34A" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
            {/* Star accents */}
            {[[55,45],[170,55],[40,160],[185,155]].map(([x,y], i) => (
              <path key={i} d={`M${x},${y} Q${x},${y+8} ${x+8},${y+8} Q${x},${y+8} ${x},${y+16} Q${x},${y+8} ${x-8},${y+8} Q${x},${y+8} ${x},${y} Z`} fill="#F59E0B" opacity="0.5"/>
            ))}
          </svg>

          {/* Clipboard — left */}
          <svg className="absolute top-[38%] left-[4%] w-[190px] h-[230px] opacity-[0.24] hidden xl:block" viewBox="0 0 190 230" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="30" width="150" height="190" rx="10" fill="#F8FAFC" stroke="#0A1F5C" strokeWidth="2.2" fillOpacity="0.7"/>
            <rect x="60" y="18" width="70" height="24" rx="6" fill="#E2E8F0" stroke="#0A1F5C" strokeWidth="1.8"/>
            <circle cx="95" cy="30" r="4" fill="#0A1F5C"/>
            {/* Rows */}
            {[80,112,144,176].map((y,i) => (
              <React.Fragment key={y}>
                {i < 3 && <polyline points={`38,${y} 46,${y+9} 60,${y-6}`} stroke="#16A34A" strokeWidth="2.2" fill="none"/>}
                {i === 3 && <circle cx="49" cy={y} r="6" stroke="#E2E8F0" strokeWidth="2" fill="none"/>}
                <line x1="72" y1={y} x2="152" y2={y} stroke="#CBD5E1" strokeWidth="1.8"/>
                {i < 2 && <line x1="72" y1={y+10} x2="130" y2={y+10} stroke="#E2E8F0" strokeWidth="1.2"/>}
              </React.Fragment>
            ))}
          </svg>
        </>
      )}

      {/* ── Universal floating accent dots (all themes) ── */}
      <div className="hidden lg:block">
        <div className="absolute top-[15%] right-[22%] w-3 h-3 rounded-full bg-[#0B5FD9] opacity-[0.15]"/>
        <div className="absolute top-[28%] left-[28%] w-2 h-2 rounded-full bg-[#16A34A] opacity-[0.15]"/>
        <div className="absolute top-[62%] right-[32%] w-4 h-4 rounded-full bg-[#F59E0B] opacity-[0.12]"/>
        <div className="absolute top-[75%] left-[22%] w-3 h-3 rounded-full bg-[#7C3AED] opacity-[0.12]"/>
        <div className="absolute top-[88%] right-[18%] w-2 h-2 rounded-full bg-[#0B5FD9] opacity-[0.15]"/>
      </div>
    </div>
  );
}
