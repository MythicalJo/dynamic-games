import { useState } from 'react';
import { ShowProvider } from '../context/ShowContext';
import { HostSidebar, type HostTab } from '../components/host/HostSidebar';
import { DisplaySwitcherBar } from '../components/host/DisplaySwitcherBar';
import { ShowControlPanel } from '../components/host/ShowControlPanel';
import { TeamsManagerPanel } from '../components/host/TeamsManagerPanel';
import { ActiveGamePanel } from '../components/host/ActiveGamePanel';
import { EventDataPanel } from '../components/host/EventDataPanel';
import { SoundboardBar } from '../components/host/SoundboardBar';
import { useHostShortcuts } from '../hooks/useHostShortcuts';
import { getDisplayWindowUrl } from '../lib/i18n';

function HostWorkspace() {
  const [activeTab, setActiveTab] = useState<HostTab>('control');
  const { shortcutNotice } = useHostShortcuts();

  const handleLaunchDisplay = () => {
    window.open(
      getDisplayWindowUrl(),
      'PuntosRapidosDisplay',
      'width=1280,height=720,menubar=no,toolbar=no'
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-studio-950 text-slate-50 lg:h-screen lg:flex-row lg:overflow-hidden">
      <HostSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onLaunchDisplay={handleLaunchDisplay}
      />

      <div className="flex min-w-0 flex-1 flex-col lg:overflow-hidden">
        <DisplaySwitcherBar />

        <div className="flex-1 overflow-y-auto">
          <main className="mx-auto w-full max-w-6xl p-5 md:p-7">
            {activeTab === 'control' && <ShowControlPanel onNavigate={setActiveTab} />}
            {activeTab === 'teams' && <TeamsManagerPanel />}
            {activeTab === 'game' && <ActiveGamePanel />}
            {activeTab === 'data' && <EventDataPanel />}
          </main>
        </div>

        <SoundboardBar shortcutNotice={shortcutNotice} />
      </div>
    </div>
  );
}

export function HostPage() {
  return (
    <ShowProvider role="host">
      <HostWorkspace />
    </ShowProvider>
  );
}
