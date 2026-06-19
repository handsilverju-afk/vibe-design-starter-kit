import { AppProvider, useApp } from './context/AppContext'
import { AppShell } from './components/layout/AppShell'
import { HomeScreen } from './pages/HomeScreen'
import { ArchiveScreen } from './pages/ArchiveScreen'
import { DetailScreen } from './pages/DetailScreen'

function Router() {
  const { view, homeKey } = useApp()

  return (
    <AppShell>
      {view.screen === 'home'    && <HomeScreen key={homeKey} />}
      {view.screen === 'archive' && <ArchiveScreen />}
      {view.screen === 'detail'  && <DetailScreen date={view.date} />}
    </AppShell>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  )
}
