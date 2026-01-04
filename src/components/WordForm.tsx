import { useEffect, useMemo, useState } from 'react'

import type { Word } from '../lib/types'
import type { WordInput } from '../lib/wordsStore'

type WordFormProps = {
  initial?: Partial<Word>
  onSubmit: (input: WordInput) => void
  onCancel?: () => void
}

export function WordForm({ initial, onSubmit, onCancel }: WordFormProps) {
  const [word, setWord] = useState(initial?.word ?? '')
  const [hint, setHint] = useState(initial?.hint ?? '')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [difficulty, setDifficulty] = useState(
    initial?.difficulty ? String(initial.difficulty) : '',
  )
  const [active, setActive] = useState(initial?.active ?? true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setWord(initial?.word ?? '')
    setHint(initial?.hint ?? '')
    setCategory(initial?.category ?? '')
    setDifficulty(initial?.difficulty ? String(initial.difficulty) : '')
    setActive(initial?.active ?? true)
  }, [initial])

  const isEdit = useMemo(() => Boolean(initial?.id), [initial])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!word.trim()) {
      setError('Word is required')
      return
    }

    const parsedDifficulty = difficulty ? Number(difficulty) : undefined
    if (parsedDifficulty && (parsedDifficulty < 1 || parsedDifficulty > 5)) {
      setError('Difficulty must be between 1 and 5')
      return
    }

    onSubmit({
      id: initial?.id,
      word,
      hint,
      category,
      difficulty: parsedDifficulty,
      active,
    })
    setError(null)
    if (!isEdit) {
      setWord('')
      setHint('')
      setCategory('')
      setDifficulty('')
      setActive(true)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-slate-800/60 border border-slate-700 rounded-xl p-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          {isEdit ? 'Edit Word' : 'Add Word'}
        </h3>
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="rounded border-slate-600"
          />
          Active
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-2 text-sm text-slate-200">
          Word *
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-200">
          Category
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
            placeholder="e.g. geography"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-200">
          Difficulty (1-5)
          <input
            type="number"
            min={1}
            max={5}
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
            placeholder="3"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-200 md:col-span-2">
          Hint / Definition
          <textarea
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white min-h-20"
            placeholder="Short hint to help the player"
          />
        </label>
      </div>

      {error && <p className="text-rose-300 text-sm">{error}</p>}

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-cyan-500 text-white font-semibold hover:bg-cyan-600 transition"
        >
          {isEdit ? 'Save Changes' : 'Add Word'}
        </button>
      </div>
    </form>
  )
}
