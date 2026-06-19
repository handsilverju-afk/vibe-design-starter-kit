import { createContext, useContext, useState } from 'react'
import { useAudio } from '../hooks/useAudio'
import { saveEntry, getEntries } from '../lib/storage'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [view, setView] = useState({ screen: 'home', date: null })
  const [toast, setToast] = useState({ visible: false, message: '' })
  const [homeKey, setHomeKey] = useState(0)
  const [entries, setEntries] = useState(() => getEntries())
  const audio = useAudio()

  function navigate(screen, date = null) {
    setView({ screen, date })
  }

  function showToast(message) {
    setToast({ visible: true, message })
    setTimeout(() => setToast({ visible: false, message: '' }), 2000)
  }

  function newPlaylist() {
    audio.stop()
    setHomeKey(k => k + 1)
    navigate('home')
  }

  function addEntry(entry) {
    saveEntry(entry)
    setEntries(getEntries())
  }

  return (
    <AppContext.Provider value={{ view, navigate, toast, showToast, audio, homeKey, newPlaylist, entries, addEntry }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
