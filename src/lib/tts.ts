import { useEffect, useState } from 'react'

type SpeakOptions = {
  voiceURI?: string
  rate?: number
  pitch?: number
  volume?: number
}

export const isSpeechSupported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window

function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!isSpeechSupported()) {
      resolve([])
      return
    }

    const voices = window.speechSynthesis.getVoices()
    if (voices.length) {
      resolve(voices)
      return
    }

    const onVoices = () => {
      resolve(window.speechSynthesis.getVoices())
      window.speechSynthesis.removeEventListener('voiceschanged', onVoices)
    }

    window.speechSynthesis.addEventListener('voiceschanged', onVoices)
    window.speechSynthesis.getVoices()
  })
}

export function useVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    let active = true
    if (!isSpeechSupported()) return

    waitForVoices().then((list) => {
      if (active) setVoices(list)
    })

    const onChange = () => {
      setVoices(window.speechSynthesis.getVoices())
    }

    window.speechSynthesis.addEventListener('voiceschanged', onChange)

    return () => {
      active = false
      window.speechSynthesis.removeEventListener('voiceschanged', onChange)
    }
  }, [])

  return voices
}

export function speak(text: string, options: SpeakOptions = {}) {
  if (!isSpeechSupported()) return

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = options.rate ?? 1
  utterance.pitch = options.pitch ?? 1
  utterance.volume = options.volume ?? 1

  if (options.voiceURI) {
    const voice = window.speechSynthesis
      .getVoices()
      .find((v) => v.voiceURI === options.voiceURI)
    if (voice) utterance.voice = voice
  }

  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}
