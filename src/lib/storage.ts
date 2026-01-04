import type { WordsPayload } from './types'

export const WORDS_STORAGE_KEY = 'spellingBee.words.v1'

const isBrowser = typeof window !== 'undefined'

export async function loadSeedWords(): Promise<WordsPayload> {
  const response = await fetch('/words.json', {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Unable to load seed words')
  }

  return response.json()
}

export function loadLocalWords(): WordsPayload | null {
  if (!isBrowser) return null
  const raw = window.localStorage.getItem(WORDS_STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as WordsPayload
  } catch (error) {
    console.error('Failed to parse local words', error)
    return null
  }
}

export function saveLocalWords(payload: WordsPayload) {
  if (!isBrowser) return
  window.localStorage.setItem(WORDS_STORAGE_KEY, JSON.stringify(payload))
}

export async function resetToSeed(): Promise<WordsPayload> {
  const seed = await loadSeedWords()
  saveLocalWords(seed)
  return seed
}
