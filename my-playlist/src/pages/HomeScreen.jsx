import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { getRecommendations } from '../api/claude'
import { enrichWithItunes } from '../lib/itunes'
import { today } from '../lib/storage'
import { MemoInput } from '../components/ui/MemoInput'
import { RecommendingIndicator } from '../components/ui/RecommendingIndicator'
import { ErrorBanner } from '../components/ui/ErrorBanner'
import { AiOrb } from '../components/ui/AiOrb'
import { PlaylistGrid } from '../components/playlist/PlaylistGrid'
import styles from './HomeScreen.module.css'

export function HomeScreen() {
  const { showToast, audio, addEntry } = useApp()
  const date = today()
  // 세션마다 고유 ID — 같은 세션 내 재저장은 업데이트, 새 세션은 새 항목
  const [sessionId] = useState(() => `${Date.now()}`)

  const [memo, setMemo] = useState('')
  const [submittedMemo, setSubmittedMemo] = useState('')
  const [summary, setSummary] = useState(null)
  const [playlists, setPlaylists] = useState([])
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [aiStopQuestion, setAiStopQuestion] = useState(null)
  const abortRef = useRef(null)

  const isWelcome = !submittedMemo

  // 추천 목록이 오면 자동재생 + 저장 (previewUrl 없는 항목은 이미 필터링됨)
  useEffect(() => {
    if (playlists.length > 0) {
      audio.playAll(playlists)
      addEntry({ sessionId, date, memo: submittedMemo, title: summary, playlists, savedAt: new Date().toISOString() })
      showToast('기록됐어요!')
    }
  }, [playlists]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchRecommendations(text) {
    const controller = new AbortController()
    abortRef.current = controller
    setSubmittedMemo(text)
    setStatus('loading')
    setErrorMsg('')
    setAiStopQuestion(null)
    try {
      const { summary: newSummary, albums } = await getRecommendations(text, controller.signal)
      setSummary(newSummary)
      const enriched = await enrichWithItunes(albums)
      const playable = enriched.filter(p => p.previewUrl)
      setPlaylists(playable)
      setStatus('ready')
    } catch (e) {
      const msg = e?.message ?? String(e)
      if (e?.name === 'AbortError' || msg.includes('abort') || msg.includes('cancel')) return
      console.error('[HomeScreen] 추천 실패:', e)
      if (msg.includes('401') || msg.includes('auth')) {
        setErrorMsg('API 키를 확인해주세요. (.env.local)')
      } else if (msg.includes('SyntaxError') || msg.includes('JSON')) {
        setErrorMsg('응답 파싱 실패. 다시 시도해주세요.')
      } else {
        setErrorMsg(`오류: ${msg.slice(0, 80)}`)
      }
      setStatus('error')
    } finally {
      abortRef.current = null
    }
  }

  function handleStop() {
    abortRef.current?.abort()
    abortRef.current = null
    setStatus('idle')
    setAiStopQuestion('오늘 기분이 어떤지, 어떤 일정이 있으신지 조금 더 알려주시면 더 잘 맞는 음악을 찾아드릴게요.')
  }

  function handleSubmit() {
    if (memo.trim().length < 10 || status === 'loading') return
    fetchRecommendations(memo.trim())
    setMemo('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handlePlay(playlist) {
    audio.toggle(playlist.id, playlists)
  }

  const isLoading = status === 'loading'
  const isActive = !isLoading && memo.trim().length >= 10
  const sendBtn = (
    <button
      className={`${styles.sendBtn} ${isLoading ? styles.stopBtn : isActive ? styles.activeBtn : ''}`}
      onClick={isLoading ? handleStop : handleSubmit}
      disabled={!isLoading && memo.trim().length < 10}
      aria-label={isLoading ? '중단' : '추천 받기'}
    >
      {isLoading ? '■' : '↑'}
    </button>
  )

  return (
    <div className={styles.screen}>
      {isWelcome ? (
        <div className={styles.welcomeScreen}>
          <AiOrb size={140} loading={status === 'loading'} />
          <div className={styles.welcomeText}>
            <p className={styles.greeting}>오늘 하루는 어떤가요?</p>
            <p className={styles.hint}>기분이나 일정을 입력하면 음악을 추천해드려요.</p>
          </div>
          <div className={styles.welcomeInput}>
            <div className={styles.inputWrap}>
              <MemoInput
                value={memo}
                onChange={setMemo}
                loading={status === 'loading'}
                onKeyDown={handleKeyDown}
              />
              {sendBtn}
            </div>
          </div>
          {status === 'error' && (
            <ErrorBanner message={errorMsg} onRetry={() => fetchRecommendations(submittedMemo)} />
          )}
        </div>
      ) : (
        <div className={styles.chatScreen}>
          <div className={styles.chatContent}>

            <div className={styles.userBubble}>
              <p className={styles.userText}>{submittedMemo}</p>
            </div>

            {status === 'loading' && (
              <div className={styles.aiBubble}>
                <RecommendingIndicator visible />
              </div>
            )}

            {aiStopQuestion && status !== 'loading' && (
              <div className={styles.aiBubble}>
                <p className={styles.aiQuestionText}>{aiStopQuestion}</p>
              </div>
            )}

            {status === 'error' && (
              <ErrorBanner message={errorMsg} onRetry={() => fetchRecommendations(submittedMemo)} />
            )}

            {playlists.length > 0 && (
              <div className={styles.playlistArea}>
                {status === 'ready' && (
                  <p className={styles.aiLabel}>오늘 바이브에 맞는 앨범이에요</p>
                )}
                <PlaylistGrid
                  playlists={playlists}
                  onPlay={handlePlay}
                  currentId={audio.currentId}
                />
              </div>
            )}
          </div>

          <div className={styles.chatInput}>
            <div className={styles.inputWrap}>
              <MemoInput
                value={memo}
                onChange={setMemo}
                loading={status === 'loading'}
                onKeyDown={handleKeyDown}
                className={styles.chatTextarea}
              />
              {sendBtn}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
