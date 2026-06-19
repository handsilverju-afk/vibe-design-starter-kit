import { useState, useRef, useEffect } from 'react'

export function useAudio() {
  const audioRef = useRef(null)
  const queueRef = useRef([])
  const indexRef = useRef(-1)
  const volumeRef = useRef(0.8)
  const [currentId, setCurrentId] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPaused, setIsPaused] = useState(false)
  const [volume, setVolumeState] = useState(0.8)
  const [currentQueue, setCurrentQueueState] = useState([])

  useEffect(() => () => { audioRef.current?.pause() }, [])

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
    const audio = new Audio(track.previewUrl)
    audio.volume = volumeRef.current
    audio.addEventListener('ended', () => playAt(indexRef.current + 1))
    audio.play().catch(() => {})
    audioRef.current = audio
    indexRef.current = index
    setCurrentId(track.id)
    setCurrentIndex(index)
    setIsPaused(false)
  }

  function toggle(id, playlists) {
    queueRef.current = playlists
    setCurrentQueueState(playlists)
    if (currentId === id) {
      if (isPaused) {
        audioRef.current?.play().catch(() => {})
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

  const currentTrack = currentQueue.find(p => p.id === currentId) ?? null
  const queueLength = currentQueue.length

  return { currentId, currentIndex, currentTrack, isPaused, volume, queueLength, toggle, stop, pause, resume, prev, next, setVolume }
}
