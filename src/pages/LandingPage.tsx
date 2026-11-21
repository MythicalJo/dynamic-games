import { ExternalLink, Languages, Monitor, Sliders, Sparkles, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ShowProvider, useShow } from '../context/ShowContext';
import { getDisplayWindowUrl } from '../lib/i18n';

function LandingContent() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useShow();

  const launchDualScreen = () => {
    window.open(
      getDisplayWindowUrl(),
      'PuntosRapidosDisplay',
      'width=1280,height=720,menubar=no,toolbar=no'
    );
    navigate('/host');
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden studio-stage-glow px-6 py-14 text-white">
      <div className="pointer-events-none absolute inset-0 studio-grid-bg opacity-65" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[120px]" />

      {/* Top-Right Language Switcher */}
      <div className="fixed top-5 right-5 z-20 flex items-center gap-1 rounded-xl border border-white/15 bg-studio-900/90 p-1 backdrop-blur-md">
        <Languages className="mx-1.5 h-4 w-4 text-cyan-300" />
        <button
          type="button"
          onClick={() => setLanguage('es')}
          className={`rounded-lg px-2.5 py-1 font-mono text-xs font-extrabold transition ${
            language === 'es'
              ? 'bg-amber-400 text-studio-950'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          ES
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`rounded-lg px-2.5 py-1 font-mono text-xs font-extrabold transition ${
            language === 'en'
              ? 'bg-cyan-400 text-studio-950'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          EN
        </button>
      </div>

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-studio-900/80 px-5 py-1.5 backdrop-blur-md">
          <Sparkles className="h-4 w-4 text-amber-300" />
          <span className="font-mono text-xs font-bold tracking-[0.25em] text-cyan-300 uppercase">
            {t.landing.badge}
          </span>
        </div>

        <h1
          className="font-display font-black uppercase tracking-wide text-gradient-gold drop-shadow-[0_10px_30px_rgba(245,168,0,0.3)]"
          style={{ fontSize: 'clamp(3.2rem, 8vw, 6.5rem)', lineHeight: 0.95 }}
        >
          PUNTOS RÁPIDOS
        </h1>

        <p className="mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
          {t.landing.descriptionPrefix}
          <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-cyan-300">/#/host</code>
          {t.landing.descriptionMiddle}
          <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-amber-300">/#/display</code>
          {t.landing.descriptionSuffix}
        </p>

        {/* Primary 1-Click Dual-Window Launcher */}
        <button
          type="button"
          onClick={launchDualScreen}
          className="mt-8 inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 px-8 py-4 text-base font-extrabold text-studio-950 shadow-[0_0_32px_rgba(255,201,51,0.38)] transition hover:scale-[1.02] hover:brightness-110 active:scale-[0.99]"
        >
          <Zap className="h-5 w-5 stroke-[2.5]" />
          <span>{t.landing.launchDualBtn}</span>
        </button>

        {/* Individual Window Cards */}
        <div className="mt-8 grid w-full grid-cols-1 gap-5 md:grid-cols-2">
          <Link
            to="/host"
            className="group flex flex-col justify-between rounded-3xl border border-cyan-400/35 bg-studio-900/80 p-7 text-left backdrop-blur-xl transition hover:border-cyan-400 hover:bg-studio-850/90 glow-cyan"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
                  <Sliders className="h-6 w-6" />
                </div>
                <span className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 font-mono text-xs font-bold text-cyan-200">
                  /#/host
                </span>
              </div>
              <h2 className="mt-5 font-display text-3xl font-black tracking-wide text-white uppercase">
                {t.landing.hostCardTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {t.landing.hostCardDesc}
              </p>
            </div>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-cyan-300 transition group-hover:translate-x-1">
              <span>{t.landing.hostCardCta}</span>
              <span>→</span>
            </div>
          </Link>

          <Link
            to="/display"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between rounded-3xl border border-amber-400/35 bg-studio-900/80 p-7 text-left backdrop-blur-xl transition hover:border-amber-400 hover:bg-studio-850/90 glow-gold"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300">
                  <Monitor className="h-6 w-6" />
                </div>
                <span className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1 font-mono text-xs font-bold text-amber-200">
                  /#/display
                </span>
              </div>
              <h2 className="mt-5 font-display text-3xl font-black tracking-wide text-white uppercase">
                {t.landing.displayCardTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {t.landing.displayCardDesc}
              </p>
            </div>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-amber-300 transition group-hover:translate-x-1">
              <span>{t.landing.displayCardCta}</span>
              <ExternalLink className="h-4 w-4" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <ShowProvider role="host">
      <LandingContent />
    </ShowProvider>
  );
}
