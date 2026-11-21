import { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Crown, Trophy } from 'lucide-react';
import { useShow } from '../../context/ShowContext';
import { TEAM_ACCENTS, type ThemeId } from '../../types/show';
import { AnimatedScore } from '../shared/AnimatedScore';

const CONFETTI_PALETTES: Record<ThemeId, string[]> = {
  blanco: ['#2563EB', '#D97706', '#059669', '#18181B', '#60A5FA'],
  sepia: ['#C2592B', '#B45309', '#2F6F4E', '#2C241E', '#E09F3E'],
  negro: ['#D4AF37', '#F4F4F5', '#22C55E', '#F59E0B', '#FDE68A'],
  pizarra: ['#34D399', '#F8FAFC', '#FBBF24', '#60A5FA', '#A7F3D0'],
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  color: string;
  rotation: number;
  vr: number;
  opacity: number;
}

function PodiumConfetti({ active, theme }: { active: boolean; theme: ThemeId }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = CONFETTI_PALETTES[theme] ?? CONFETTI_PALETTES.blanco;
    const particles: Particle[] = [];
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Dos ráfagas laterales + lluvia superior editorial limpia
    for (let i = 0; i < 120; i++) {
      const fromLeft = i % 3 === 0;
      const fromRight = i % 3 === 1;
      const x = fromLeft
        ? width * 0.14
        : fromRight
          ? width * 0.86
          : Math.random() * width;
      const y = fromLeft || fromRight ? height * 0.68 : -20 - Math.random() * 140;
      const angle = fromLeft
        ? -Math.PI / 3 + (Math.random() - 0.5) * 0.6
        : fromRight
          ? (-2 * Math.PI) / 3 + (Math.random() - 0.5) * 0.6
          : Math.PI / 2 + (Math.random() - 0.5) * 0.45;
      const speed = fromLeft || fromRight ? 10 + Math.random() * 9 : 2.5 + Math.random() * 4;

      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        w: 7 + Math.random() * 7,
        h: 4 + Math.random() * 5,
        color: colors[i % colors.length],
        rotation: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.22,
        opacity: 1,
      });
    }

    const startTime = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      let alive = 0;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // gravedad
        p.vx *= 0.992; // arrastre suave
        p.rotation += p.vr;

        if (elapsed > 3000) {
          p.opacity = Math.max(0, p.opacity - 0.018);
        }

        if (p.opacity > 0.02 && p.y < window.innerHeight + 40) {
          alive += 1;
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      }

      if (alive > 0 && elapsed < 5200) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [active, theme]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-40 h-full w-full"
      aria-hidden="true"
    />
  );
}

export function PodiumScreen() {
  const { state, theme } = useShow();
  const revealStep = state.podiumRevealStep;

  const topThree = useMemo(() => {
    return [...state.teams]
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
      .slice(0, 3);
  }, [state.teams]);

  const first = topThree[0] ?? null;
  const second = topThree[1] ?? null;
  const third = topThree[2] ?? null;

  const showThird = revealStep >= 1;
  const showSecond = revealStep >= 2;
  const showFirst = revealStep >= 3;

  return (
    <div className="relative flex h-full w-full flex-col justify-between px-10 py-10 md:px-20 md:py-12">
      <PodiumConfetti active={showFirst} theme={theme} />

      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-1.5 font-mono text-xs font-bold tracking-[0.26em] text-accent uppercase">
          <Trophy className="h-3.5 w-3.5" />
          GRAN FINAL · PODIO OFICIAL
        </span>
        <h1
          className="mt-3 font-extrabold tracking-tight text-ink uppercase"
          style={{ fontSize: 'clamp(2.6rem, 5.8vw, 5rem)', lineHeight: 0.96 }}
        >
          {showFirst && first ? `¡CAMPEONES: ${first.name}!` : state.eventMeta.title || 'PUNTOS RÁPIDOS'}
        </h1>
      </div>

      {/* 3-Column Architectural Podium (2.º | 1.º | 3.º) */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 items-end justify-center gap-5 pt-8 pb-4 md:gap-8">
        {/* 2.º LUGAR (Left) */}
        <div className="flex w-1/3 max-w-sm flex-col items-center">
          {showSecond && second ? (
            <motion.div
              key={`p2-${second.id}`}
              initial={{ opacity: 0, y: 28, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="mb-4 w-full text-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: TEAM_ACCENTS[second.accent].hex }}
                />
                <span className="font-mono text-xs font-bold text-ink-muted">2.º LUGAR</span>
              </div>
              <div className="mt-2 truncate text-2xl font-extrabold tracking-tight text-ink uppercase md:text-4xl">
                {second.name}
              </div>
              <div className="mt-0.5 truncate text-sm font-medium text-ink-muted md:text-lg">
                {second.playerA} y {second.playerB}
              </div>
              <div className="mt-2 font-mono text-2xl font-extrabold text-accent md:text-3xl">
                <AnimatedScore value={second.score} /> <span className="text-sm text-ink-subtle">PTS</span>
              </div>
            </motion.div>
          ) : (
            <div className="mb-4 text-center font-mono text-sm font-bold tracking-[0.2em] text-ink-subtle uppercase">
              2.º LUGAR · ?
            </div>
          )}

          <div
            className={`flex h-44 w-full flex-col items-center justify-center rounded-t-3xl border-2 border-b-0 transition-colors md:h-52 ${
              showSecond
                ? 'border-line-strong bg-surface'
                : 'border-dashed border-line bg-surface/50'
            }`}
          >
            <span className="font-mono text-5xl font-extrabold text-ink-muted md:text-6xl">2.º</span>
          </div>
        </div>

        {/* 1.er LUGAR (Tall Center Champion) */}
        <div className="flex w-1/3 max-w-md flex-col items-center">
          {showFirst && first ? (
            <motion.div
              key={`p1-${first.id}`}
              initial={{ opacity: 0, y: 36, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20 }}
              className="mb-4 w-full text-center"
            >
              <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-fg shadow-md">
                <Crown className="h-8 w-8" />
              </div>
              <div className="truncate text-3xl font-extrabold tracking-tight text-ink uppercase md:text-5xl">
                {first.name}
              </div>
              <div className="mt-1 truncate text-base font-semibold text-ink-muted md:text-xl">
                {first.playerA} y {first.playerB}
              </div>
              <div className="mt-2 font-mono text-3xl font-extrabold text-accent md:text-4xl">
                <AnimatedScore value={first.score} /> <span className="text-base text-ink-subtle">PTS</span>
              </div>
            </motion.div>
          ) : (
            <div className="mb-5 text-center font-mono text-sm font-bold tracking-[0.22em] text-accent uppercase">
              1.ER LUGAR · ?
            </div>
          )}

          <div
            className={`flex h-60 w-full flex-col items-center justify-center rounded-t-3xl border-2 border-b-0 transition-colors md:h-72 ${
              showFirst
                ? 'border-accent bg-accent text-accent-fg shadow-xl'
                : 'border-dashed border-accent/50 bg-accent-soft text-accent'
            }`}
          >
            <span className="font-mono text-6xl font-extrabold md:text-7xl">1.º</span>
          </div>
        </div>

        {/* 3.er LUGAR (Right) */}
        <div className="flex w-1/3 max-w-sm flex-col items-center">
          {showThird && third ? (
            <motion.div
              key={`p3-${third.id}`}
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="mb-4 w-full text-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: TEAM_ACCENTS[third.accent].hex }}
                />
                <span className="font-mono text-xs font-bold text-ink-muted">3.ER LUGAR</span>
              </div>
              <div className="mt-2 truncate text-2xl font-extrabold tracking-tight text-ink uppercase md:text-4xl">
                {third.name}
              </div>
              <div className="mt-0.5 truncate text-sm font-medium text-ink-muted md:text-lg">
                {third.playerA} y {third.playerB}
              </div>
              <div className="mt-2 font-mono text-2xl font-extrabold text-accent md:text-3xl">
                <AnimatedScore value={third.score} /> <span className="text-sm text-ink-subtle">PTS</span>
              </div>
            </motion.div>
          ) : (
            <div className="mb-4 text-center font-mono text-sm font-bold tracking-[0.2em] text-ink-subtle uppercase">
              3.ER LUGAR · ?
            </div>
          )}

          <div
            className={`flex h-32 w-full flex-col items-center justify-center rounded-t-3xl border-2 border-b-0 transition-colors md:h-36 ${
              showThird
                ? 'border-line-strong bg-surface'
                : 'border-dashed border-line bg-surface/50'
            }`}
          >
            <span className="font-mono text-4xl font-extrabold text-ink-muted md:text-5xl">3.º</span>
          </div>
        </div>
      </div>

      {/* Subtle Bottom Line */}
      <div className="border-t border-line pt-4 text-center font-mono text-xs font-bold tracking-[0.24em] text-ink-subtle uppercase">
        {showFirst ? '¡GRACIAS POR JUGAR ESTA NOCHE!' : 'REVELANDO A LOS GANADORES...'}
      </div>
    </div>
  );
}
