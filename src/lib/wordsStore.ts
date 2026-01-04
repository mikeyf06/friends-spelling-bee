import { useCallback, useEffect, useMemo, useState } from 'react'

import { loadLocalWords, loadSeedWords, resetToSeed, saveLocalWords } from './storage'
import type { Word, WordsPayload } from './types'

export type WordInput = Omit<Word, 'id'> & { id?: string }

const ensureUpdatedAt = (payload: WordsPayload): WordsPayload => ({
  ...payload,
  updatedAt: new Date().toISOString(),
})

export function useWords() {
  const [payload, setPayload] = useState<WordsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const local = loadLocalWords()
        if (local) {
          if (mounted) {
            setPayload(local)
            setLoading(false)
          }
          return
        }
        const seed = await loadSeedWords()
        if (mounted) {
          setPayload(seed)
          saveLocalWords(seed)
        }
      } catch (err) {
        console.error(err)
        if (mounted) {
          setError('Unable to load words')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  const updatePayload = useCallback((updater: (current: WordsPayload) => WordsPayload) => {
    setPayload((current) => {
      if (!current) return current
      const next = ensureUpdatedAt(updater(current))
      saveLocalWords(next)
      return next
    })
  }, [])

  const addWord = useCallback(
    (input: WordInput) => {
      updatePayload((current) => ({
        ...current,
        words: [
          ...current.words,
          {
            id: input.id ?? crypto.randomUUID(),
            word: input.word.trim(),
            hint: input.hint?.trim() || undefined,
            category: input.category?.trim() || undefined,
            difficulty: input.difficulty,
            active: input.active ?? true,
          },
        ],
      }))
    },
    [updatePayload],
  )

  const updateWord = useCallback(
    (id: string, patch: Partial<Word>) => {
      updatePayload((current) => ({
        ...current,
        words: current.words.map((w) =>
          w.id === id
            ? {
                ...w,
                ...patch,
              }
            : w,
        ),
      }))
    },
    [updatePayload],
  )

  const deleteWord = useCallback(
    (id: string) => {
      updatePayload((current) => ({
        ...current,
        words: current.words.filter((w) => w.id !== id),
      }))
    },
    [updatePayload],
  )

  const toggleActive = useCallback(
    (id: string) => {
      updatePayload((current) => ({
        ...current,
        words: current.words.map((w) =>
          w.id === id
            ? {
                ...w,
                active: !w.active,
              }
            : w,
        ),
      }))
    },
    [updatePayload],
  )

  const importWords = useCallback(
    (incoming: WordsPayload) => {
      const sanitized: WordsPayload = ensureUpdatedAt({
        version: incoming.version ?? 1,
        updatedAt: incoming.updatedAt ?? new Date().toISOString(),
        words: incoming.words.map((w) => ({
          ...w,
          id: w.id || crypto.randomUUID(),
          word: w.word.trim(),
          active: w.active ?? true,
        })),
      })
      saveLocalWords(sanitized)
      setPayload(sanitized)
    },
    [],
  )

  const exportWords = useCallback(() => payload, [payload])

  const reset = useCallback(async () => {
    const seed = await resetToSeed()
    setPayload(seed)
  }, [])

  const stats = useMemo(() => {
    if (!payload) return { total: 0, active: 0 }
    const total = payload.words.length
    const active = payload.words.filter((w) => w.active !== false).length
    return { total, active }
  }, [payload])

  return {
    payload,
    loading,
    error,
    addWord,
    updateWord,
    deleteWord,
    toggleActive,
    importWords,
    exportWords,
    reset,
    stats,
  }
}

export function getActiveWords(words: Word[]): Word[] {
  return words.filter((w) => w.active !== false)
}
