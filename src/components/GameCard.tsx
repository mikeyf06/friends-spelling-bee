import { useCallback, useEffect, useMemo, useState } from 'react'

import { isCorrect, pickNextWordId } from '../lib/utils'
import type { AttemptRecord, GameSettings, Team, Word } from '../lib/types'
import { isSpeechSupported, speak } from '../lib/tts'

type GameCardProps = {
  words: Word[]
  settings: GameSettings
  onAttempt: (attempt: AttemptRecord) => void
  team?: Team | null
}

export function GameCard({ words, settings, onAttempt, team }: GameCardProps) {
  const [currentWordId, setCurrentWordId] = useState<string | null>(null)
  const [selectionState, setSelectionState] = useState({ index: 0, queue: [] as string[] })
  const [attempt, setAttempt] = useState('')
  const [result, setResult] = useState<{ correct: boolean; expected: string } | null>(null)
  const [showWord, setShowWord] = useState(false)
  const speechAvailable = isSpeechSupported()

  const currentWord = useMemo(
    () => words.find((w) => w.id === currentWordId) ?? null,
    [words, currentWordId],
  )

  const chooseNext = useCallback(
    (reset = false) => {
      setSelectionState((prev) => {
        const baseState = reset ? { index: 0, queue: [] as string[] } : prev
        const { id, state: nextState } = pickNextWordId(
          words,
          settings.selectionMode,
          baseState,
        )
        setCurrentWordId(id)
        setAttempt('')
        setResult(null)
        return nextState
      })
    },
    [settings.selectionMode, words],
  )

  useEffect(() => {
    if (words.length === 0) {
      setCurrentWordId(null)
      return
    }
    chooseNext(true)
  }, [words, settings.selectionMode, chooseNext])

  const handleSpeak = () => {
    if (!speechAvailable || !currentWord) return
    speak(currentWord.word, {
      voiceURI: settings.voiceURI,
      rate: settings.rate,
      pitch: settings.pitch,
    })
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!currentWord) return
    const correct = isCorrect(attempt, currentWord.word)
    const record: AttemptRecord = {
      id: crypto.randomUUID(),
      wordId: currentWord.id,
      expected: currentWord.word,
      attempt,
      correct,
      at: Date.now(),
      hint: currentWord.hint,
      teamId: team?.id,
      teamName: team?.name,
    }
    setResult({ correct, expected: currentWord.word })
    onAttempt(record)
  }

  const stats = useMemo(() => {
    const categories = Array.from(new Set(words.map((w) => w.category).filter(Boolean)))
    return { categories }
  }, [words])

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 md:p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Spelling Bee</h2>
            {team && (
              <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-100 border border-slate-600">
                {team.name}
              </span>
            )}
          </div>
          <p className="text-slate-300 text-sm">
            Active words: {words.length} 
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSpeak}
            disabled={!currentWord || !speechAvailable}
            className="px-4 py-2 rounded-lg bg-cyan-500 text-white font-semibold hover:bg-cyan-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hear Word
          </button>
          <button
            onClick={() => chooseNext()}
            disabled={!words.length}
            className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next Word
          </button>
        </div>
      </div>

      {!speechAvailable && (
        <p className="text-sm text-amber-200 bg-amber-500/10 border border-amber-500/30 p-3 rounded">
          Audio not supported in this browser. Use the reveal option below.
        </p>
      )}

      <div className="flex items-center justify-between bg-slate-950/60 border border-slate-900 rounded-lg p-3">
        <div>
          <p className="text-xs uppercase text-slate-400">Current word (host view)</p>
          <p className="text-lg font-semibold text-white">
            {showWord ? (currentWord ? currentWord.word : '—') : 'Hidden'}
          </p>
        </div>
        <button
          onClick={() => setShowWord((prev) => !prev)}
          className="px-3 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition"
        >
          {showWord ? 'Hide word' : 'Show word'}
        </button>
      </div>
      {!showWord && currentWord && (
        <p className="text-sm text-slate-300">
          Hidden. Click “Show word” to reveal for the host. Players should be looking away.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-sm text-slate-200">
          Type the spelling:
          <input
            type="text"
            value={attempt}
            onChange={(e) => setAttempt(e.target.value)}
            className="mt-2 w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-800 text-white"
            placeholder="Start typing..."
            disabled={!words.length}
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!words.length}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={() => setAttempt('')}
            className="px-3 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition"
          >
            Clear
          </button>
          {!speechAvailable && currentWord && (
            <span className="text-sm text-slate-300">
              Word: <span className="font-semibold text-white">{currentWord.word}</span>
            </span>
          )}
          {currentWord?.hint && (
            <span className="text-sm text-slate-300">
              Hint: <span className="font-semibold text-white">{currentWord.hint}</span>
            </span>
          )}
        </div>
      </form>

      {result && (
        <div
          className={`p-4 rounded-lg border ${
            result.correct
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-100'
              : 'bg-rose-500/10 border-rose-500/40 text-rose-100'
          }`}
        >
          <p className="font-semibold text-lg">
            {result.correct ? '✅ Correct!' : '❌ Incorrect'}
          </p>
          {!result.correct && (
            <p className="text-sm mt-1">
              Correct spelling: <span className="font-semibold">{result.expected}</span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
