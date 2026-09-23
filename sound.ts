"use client"

// Lightweight Web Audio helper — no asset files needed.
// Generates short blocky/8-bit style blips for game feedback.

type SoundName = "click" | "reveal" | "win" | "lose" | "flip" | "tick" | "cashout"

let ctx: AudioContext | null = null
const STORAGE_KEY = "blockflip-muted"

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (ctx) return ctx
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtx) return null
  ctx = new AudioCtx()
  return ctx
}

export function isMuted(): boolean {
  if (typeof window === "undefined") return false
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

export function setMuted(muted: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, muted ? "1" : "0")
  } catch {
    // ignore
  }
}

type Note = { freq: number; start: number; duration: number; type?: OscillatorType; gain?: number }

const PATTERNS: Record<SoundName, Note[]> = {
  click: [{ freq: 220, start: 0, duration: 0.06, type: "square", gain: 0.15 }],
  reveal: [{ freq: 440, start: 0, duration: 0.08, type: "square", gain: 0.16 }],
  tick: [{ freq: 320, start: 0, duration: 0.04, type: "square", gain: 0.1 }],
  flip: [
    { freq: 300, start: 0, duration: 0.05, type: "square", gain: 0.14 },
    { freq: 500, start: 0.06, duration: 0.05, type: "square", gain: 0.14 },
  ],
  win: [
    { freq: 523, start: 0, duration: 0.09, type: "square", gain: 0.18 },
    { freq: 659, start: 0.09, duration: 0.09, type: "square", gain: 0.18 },
    { freq: 784, start: 0.18, duration: 0.14, type: "square", gain: 0.18 },
  ],
  cashout: [
    { freq: 659, start: 0, duration: 0.08, type: "square", gain: 0.18 },
    { freq: 988, start: 0.08, duration: 0.16, type: "square", gain: 0.18 },
  ],
  lose: [
    { freq: 200, start: 0, duration: 0.12, type: "sawtooth", gain: 0.16 },
    { freq: 130, start: 0.12, duration: 0.2, type: "sawtooth", gain: 0.16 },
  ],
}

export function playSound(name: SoundName) {
  if (isMuted()) return
  const audio = getCtx()
  if (!audio) return
  if (audio.state === "suspended") void audio.resume()

  const now = audio.currentTime
  for (const note of PATTERNS[name]) {
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.type = note.type ?? "square"
    osc.frequency.value = note.freq
    const g = note.gain ?? 0.15
    const startAt = now + note.start
    gain.gain.setValueAtTime(0.0001, startAt)
    gain.gain.exponentialRampToValueAtTime(g, startAt + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + note.duration)
    osc.connect(gain)
    gain.connect(audio.destination)
    osc.start(startAt)
    osc.stop(startAt + note.duration + 0.02)
  }
}
