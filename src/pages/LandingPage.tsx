import { ArrowUpRight, ExternalLink, Monitor, Sliders } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ShowProvider, useShow } from '../context/ShowContext';
import { getDisplayWindowUrl } from '../lib/i18n';
import { THEMES } from '../types/show';

function LandingContent() {
  const navigate = useNavigate();
  const { theme, setTheme, t } = useShow();

  const launchDualScreen = () => {
    window.open(
      getDisplayWindowUrl(),
      'PuntosRapidosDisplay',
      'width=1280,height=720,menubar=no,toolbar=no'
    );
    navigate('/host');
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      {/* Minimal Top Bar */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
          <span className="text-sm font-bold tracking-tight uppercase">Puntos Rápidos</span>
        </div>

        {/* 4 Minimalist Theme Swatches */}
        <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-1">
          {THEMES.map((item) => {
            const active = theme === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTheme(item.id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                  active
                    ? 'bg-ink text-canvas'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full border border-black/15"
                  style={{ backgroundColor: item.bgSwatch }}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Centered Editorial Hero */}
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <span className="inline-flex items-center rounded-full border border-line bg-surface px-3.5 py-1 font-mono text-[11px] font-semibold tracking-[0.16em] text-ink-muted uppercase">
          {t.landing.badge}
        </span>

        <h1
          className="mt-6 font-extrabold tracking-tight text-ink"
          style={{ fontSize: 'clamp(2.8rem, 7vw, 5.2rem)', lineHeight: 0.98 }}
        >
          PUNTOS RÁPIDOS
        </h1>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
          {t.landing.descriptionPrefix}
          <code className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-xs text-ink">
            /#/host
          </code>
          {t.landing.descriptionMiddle}
          <code className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-xs text-ink">
            /#/display
          </code>
          {t.landing.descriptionSuffix}
        </p>

        <button
          type="button"
          onClick={launchDualScreen}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-bold text-accent-fg transition hover:opacity-90 active:scale-[0.99]"
        >
          <span>{t.landing.launchDualBtn}</span>
          <ArrowUpRight className="h-4 w-4" />
        </button>

        {/* Two Clean Window Cards */}
        <div className="mt-12 grid w-full grid-cols-1 gap-4 md:grid-cols-2">
          <Link
            to="/host"
            className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-7 text-left transition hover:border-line-strong"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-canvas text-accent">
                  <Sliders className="h-5 w-5" />
                </div>
                <span className="font-mono text-xs font-medium text-ink-subtle">/#/host</span>
              </div>
              <h2 className="mt-5 text-xl font-bold tracking-tight text-ink">
                {t.landing.hostCardTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {t.landing.hostCardDesc}
              </p>
            </div>
            <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition group-hover:translate-x-0.5">
              <span>{t.landing.hostCardCta}</span>
              <span>→</span>
            </div>
          </Link>

          <Link
            to="/display"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-7 text-left transition hover:border-line-strong"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-canvas text-ink">
                  <Monitor className="h-5 w-5" />
                </div>
                <span className="font-mono text-xs font-medium text-ink-subtle">/#/display</span>
              </div>
              <h2 className="mt-5 text-xl font-bold tracking-tight text-ink">
                {t.landing.displayCardTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {t.landing.displayCardDesc}
              </p>
            </div>
            <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition group-hover:translate-x-0.5">
              <span>{t.landing.displayCardCta}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </div>
          </Link>
        </div>
      </main>
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
