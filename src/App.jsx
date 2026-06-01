import { useState } from 'react'
import { useApp } from './context/AppContext'
import Login from './components/Login'
import Header from './components/Header'
import HomePage from './components/HomePage'
import SchedulePage from './pages/SchedulePage'
import EmployeesPage from './pages/EmployeesPage'
import PrioritiesPage from './pages/PrioritiesPage'
import SettingsPage from './pages/SettingsPage'

const SESSION_KEY = 'cafe_unlocked'

export default function App() {
  const { data, setSelectedMonth } = useApp()
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')
  const [view, setView] = useState('home') // 'home' | 'month'
  const [tab, setTab] = useState('schedule')

  function unlock() {
    sessionStorage.setItem(SESSION_KEY, '1')
    setUnlocked(true)
  }
  function logout() {
    sessionStorage.removeItem(SESSION_KEY)
    setUnlocked(false)
    setView('home')
  }

  // 若還沒設定密碼，或這個工作階段尚未解鎖 → 顯示登入畫面
  if (!data.auth.passwordHash || !unlocked) {
    return <Login onUnlock={unlock} />
  }

  // 首頁：選擇月份
  if (view === 'home') {
    return (
      <HomePage
        onOpenMonth={(key) => {
          setSelectedMonth(key)
          setTab('schedule')
          setView('month')
        }}
        onSettings={() => {
          setTab('settings')
          setView('month')
        }}
        onLogout={logout}
      />
    )
  }

  // 月份頁：排班 / 員工 / 班別順序 / 設定
  return (
    <div className="min-h-screen bg-bg">
      <Header tab={tab} setTab={setTab} onLogout={logout} onHome={() => setView('home')} />
      <main className="mx-auto max-w-[1400px] px-4 py-6">
        <div key={tab} className="animate-fade-up">
          {tab === 'schedule' && <SchedulePage />}
          {tab === 'employees' && <EmployeesPage />}
          {tab === 'priorities' && <PrioritiesPage />}
          {tab === 'settings' && <SettingsPage />}
        </div>
      </main>
    </div>
  )
}
