import { useState, useRef, useEffect } from 'react'

export function useAudio() {
  const audioRef = useRef(null)
  const queueRef = useRef([])
  const indexRef = useRef(-1)
  const volumeRef = useRef(0.8)
  const loopRef = useRef(true)
  const [currentId, setCurrentId] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPaused, setIsPaused] = useState(false)
  const [volume, setVolumeState] = useState(0.8)
  const [loop, setLoopState] = useState(true)
  const [currentQueue, setCurrentQueueState] = useState([])
  const [queueSeed, setQueueSeed] = useState(1)

  // Web Audio API for real-time beat analysis
  const contextRef = useRef(null)
  const analyserRef = useRef(null)
  const sourceRef = useRef(null)

  useEffect(() => () => {
    audioRef.current?.pause()
    try { contextRef.current?.close() } catch {}
  }, [])

  // Create AudioContext once — must be called inside a user-gesture handler
  function initContext() {
    if (contextRef.current) return
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const a = ctx.createAnalyser()
      a.fftSize = 256
      a.smoothingTimeConstant = 0.80
      a.connect(ctx.destination)
      contextRef.current = ctx
      analyserRef.current = a
    } catch (e) {
      // AudioContext unavailable (strict browser policy etc.)
    }
  }

  // Route audio element through AnalyserNode — called once per Audio element
  function connectSource(audio) {
    if (!analyserRef.current || !contextRef.current) return
    try {
      if (sourceRef.current) {
        try { sourceRef.current.disconnect() } catch {}
        sourceRef.current = null
      }
      sourceRef.current = contextRef.current.createMediaElementSource(audio)
      sourceRef.current.connect(analyserRef.current)
      contextRef.current.resume().catch(() => {})
    } catch (e) {
      // SecurityError (CORS blocked) or InvalidStateError
      // Audio still plays via its own output; beat analysis falls back to BPM pseudo-beat
      analyserRef.current = null
      sourceRef.current = null
    }
  }

  function playAt(index) {
    const queue = queueRef.current
    if (index < 0 || index >= queue.length) {
      audioRef.current = null
      indexRef.current = -1
      setCurrentId(null)
      setCurrentIndex(-1)
      setIsPaused(false)
      return
    }
    const track = queue[index]
    if (!track.previewUrl) { playAt(index + 1); return }

    audioRef.current?.pause()
    initContext()  // AudioContext must be created in user-gesture context

    // Reusable ended handler
    function attachEnded(aud) {
      aud.addEventListener('ended', () => {
        const nextIdx = indexRef.current + 1
        if (nextIdx >= queueRef.current.length) {
          if (loopRef.current) playAt(0)
          else setIsPaused(true)
        } else {
          playAt(nextIdx)
        }
      })
    }

    // Attempt CORS mode for Web Audio API
    const audio = new Audio()
    audio.crossOrigin = 'anonymous'
    audio.src = track.previewUrl
    audio.volume = volumeRef.current
    attachEnded(audio)

    // On successful load — connect to AudioContext analyser
    audio.addEventListener('canplay', () => {
      connectSource(audio)
    }, { once: true })

    // CORS failure — recreate without crossOrigin (audio plays, no beat analysis)
    audio.addEventListener('error', () => {
      if (audioRef.current !== audio) return
      analyserRef.current = null
      const plain = new Audio(track.previewUrl)
      plain.volume = volumeRef.current
      attachEnded(plain)
      plain.play().catch(() => {})
      audioRef.current = plain
    }, { once: true })

    audio.play().catch(() => {})
    audioRef.current = audio
    indexRef.current = index
    setCurrentId(track.id)
    setCurrentIndex(index)
    setIsPaused(false)
  }

  function hashQueue(playlists) {
    let h = 0
    for (const t of playlists.slice(0, 6)) {
      const s = (t.id ?? '') + (t.title ?? '')
      for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
    }
    return Math.abs(h) || 1
  }

  function playAll(playlists) {
    queueRef.current = playlists
    setCurrentQueueState(playlists)
    setQueueSeed(hashQueue(playlists))
    playAt(0)
  }

  function toggle(id, playlists) {
    queueRef.current = playlists
    setCurrentQueueState(playlists)
    setQueueSeed(hashQueue(playlists))
    if (currentId === id) {
      if (isPaused) {
        audioRef.current?.play().catch(() => {})
        contextRef.current?.resume().catch(() => {})
        setIsPaused(false)
      } else {
        audioRef.current?.pause()
        setIsPaused(true)
      }
      return
    }
    const index = playlists.findIndex(p => p.id === id)
    if (index !== -1) playAt(index)
  }

  function stop() {
    audioRef.current?.pause()
    audioRef.current = null
    indexRef.current = -1
    setCurrentId(null)
    setCurrentIndex(-1)
    setIsPaused(false)
  }

  function pause() {
    audioRef.current?.pause()
    setIsPaused(true)
  }

  function resume() {
    audioRef.current?.play().catch(() => {})
    contextRef.current?.resume().catch(() => {})
    setIsPaused(false)
  }

  function prev() {
    if (indexRef.current > 0) playAt(indexRef.current - 1)
  }

  function next() {
    playAt(indexRef.current + 1)
  }

  function setVolume(v) {
    volumeRef.current = v
    setVolumeState(v)
    if (audioRef.current) audioRef.current.volume = v
  }

  function setLoop(v) {
    loopRef.current = v
    setLoopState(v)
  }

  const currentTrack = currentQueue.find(p => p.id === currentId) ?? null
  const queueLength = currentQueue.length

  return {
    currentId, currentIndex, currentTrack, isPaused, volume, loop, queueLength,
    toggle, playAll, stop, pause, resume, prev, next, setVolume, setLoop,
    analyserRef,  // exposed so NowPlayingBanner can read frequency data
    queueSeed,    // stable numeric seed per playlist session — for scene shuffle
  }
}
