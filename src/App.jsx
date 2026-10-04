import { useCallback, useRef, useState } from 'react';
import { MobileHeader, NavRail } from './components/Rail';
import { ProjectDialog } from './components/ProjectDialog';
import { Hero } from './components/sections/Hero';
import { Work } from './components/sections/Work';
import { Stories } from './components/sections/Stories';
import { ExploreSui } from './components/sections/ExploreSui';
import { Capabilities } from './components/sections/Capabilities';
import { Toolbox } from './components/sections/Toolbox';
import { Contact } from './components/sections/Contact';
import { NAV_ITEMS } from './data/content';
import { useActiveSection, useHashLanding } from './hooks/useStudioHooks';
import { StudioProvider } from './theme/ThemeProvider';

const SECTION_IDS = NAV_ITEMS.map((item) => item.id);

function Studio() {
  const activeId = useActiveSection(SECTION_IDS);
  useHashLanding();
  const [projectId, setProjectId] = useState(null);
  const triggerRef = useRef(null);

  const openProject = useCallback((id, trigger) => {
    triggerRef.current = trigger ?? null;
    setProjectId(id);
  }, []);
  const closeProject = useCallback(() => setProjectId(null), []);

  return (
    <>
      <a
        href="#stories"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-primary focus:px-4 focus:py-3 focus:text-primary-fg"
      >
        Skip to selected work
      </a>

      {/* Soft page backdrop: two token-colored washes behind everything (no extra canvas). */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(70% 50% at 85% -10%, color-mix(in srgb, var(--soft) 55%, transparent), transparent 70%), radial-gradient(60% 45% at -10% 30%, color-mix(in srgb, var(--deco-2) 30%, transparent), transparent 70%)',
        }}
      />

      <MobileHeader activeId={activeId} />
      <NavRail activeId={activeId} />

      <main className="lg:pl-[84px]">
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-10 xl:px-14">
          <Hero />
          <Stories />
          <Capabilities />
          <Work onOpenProject={openProject} />
          <div id="explore">
            <Toolbox />
            <ExploreSui />
          </div>
          <Contact />
        </div>
      </main>

      <ProjectDialog projectId={projectId} returnFocus={triggerRef} onClose={closeProject} />
    </>
  );
}

export default function App() {
  return (
    <StudioProvider>
      <Studio />
    </StudioProvider>
  );
}
