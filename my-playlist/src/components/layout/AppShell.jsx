import { useApp } from '../../context/AppContext'
import { SideNav } from './SideNav'
import { NowPlayingBanner } from '../ui/NowPlayingBanner'
import { Toast } from '../ui/Toast'
import styles from './AppShell.module.css'

export function AppShell({ children }) {
  const { toast, audio } = useApp()

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <SideNav />
      </aside>
      <div className={styles.main}>
        {audio.currentTrack && (
          <NowPlayingBanner
            playlist={audio.currentTrack}
            isPaused={audio.isPaused}
            onPlayPause={() => audio.isPaused ? audio.resume() : audio.pause()}
            onStop={audio.stop}
            onPrev={audio.prev}
            onNext={audio.next}
            canPrev={audio.currentIndex > 0}
            canNext={audio.currentIndex < audio.queueLength - 1}
            volume={audio.volume}
            onVolumeChange={audio.setVolume}
            trackIndex={audio.currentIndex}
            loop={audio.loop}
            onLoopToggle={() => audio.setLoop(!audio.loop)}
            analyser={audio.analyserRef}
            queueSeed={audio.queueSeed}
          />
        )}
        <div className={styles.content}>
          {children}
        </div>
      </div>
      {toast.visible && <Toast message={toast.message} />}
    </div>
  )
}
