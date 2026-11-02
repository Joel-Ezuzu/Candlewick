import { Outlet } from 'react-router-dom'
import { TabBar } from './TabBar'

export function AppShell() {
  return (
    <div className="min-h-dvh bg-surface">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-gold focus:px-4 focus:py-2 focus:font-semibold focus:text-on-gold"
      >
        Skip to content
      </a>
      <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col border-x border-line bg-bg">
        <main id="main" tabIndex={-1} className="flex-1 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-24 outline-none">
          <Outlet />
        </main>
        <TabBar />
      </div>
    </div>
  )
}
