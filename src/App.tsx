import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import Coin from './pages/Coin'
import Market from './pages/Market'
import NotFound from './pages/NotFound'
import Watchlist from './pages/Watchlist'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Market />} />
        <Route path="coin/:id" element={<Coin />} />
        <Route path="watchlist" element={<Watchlist />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
