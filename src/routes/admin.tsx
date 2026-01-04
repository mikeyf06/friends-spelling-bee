import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useRef, useState } from 'react'

import { WordForm } from '../components/WordForm'
import { WordTable } from '../components/WordTable'
import type { Word } from '../lib/types'
import { useWords, type WordInput } from '../lib/wordsStore'

export const Route = createFileRoute('/admin')({ component: AdminScreen })

function AdminScreen() {
  const {
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
  } = useWords()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Word | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleAdd = (input: WordInput) => {
    const exists = payload.words.some(
      (w) => w.word.toLowerCase() === input.word.trim().toLowerCase(),
    )
    if (exists) {
      setMessage('Duplicate word detected')
      return
    }
    addWord(input)
    setMessage('Word saved')
  }

  const handleUpdate = (input: WordInput) => {
    if (!editing?.id) return
    const exists = payload.words.some(
      (w) => w.id !== editing.id && w.word.toLowerCase() === input.word.trim().toLowerCase(),
    )
    if (exists) {
      setMessage('Duplicate word detected')
      return
    }
    updateWord(editing.id, input)
    setEditing(null)
    setMessage('Word updated')
  }

  const downloadExport = () => {
    const data = exportWords()
    if (!data) return
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'spelling-bee-words.json'
    link.click()
    URL.revokeObjectURL(url)
    setMessage('Exported JSON')
  }

  const handleImport = async (file: File) => {
    const text = await file.text()
    try {
      const parsed = JSON.parse(text)
      if (!parsed.words || !Array.isArray(parsed.words)) {
        setMessage('Import failed: invalid structure')
        return
      }
      importWords(parsed)
      setMessage('Import complete')
    } catch (err) {
      console.error(err)
      setMessage('Import failed: invalid JSON')
    }
  }

  const categories = useMemo(() => {
    if (!payload) return []
    return Array.from(new Set(payload.words.map((w) => w.category).filter(Boolean))).sort()
  }, [payload])

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Loading words...</p>
      </main>
    )
  }

  if (error || !payload) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-rose-200">Unable to load words right now.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase text-slate-400 tracking-wide">Admin</p>
          <h1 className="text-3xl font-black">Word Bank</h1>
          <p className="text-slate-300 text-sm">
            Manage the shared list. Updates persist locally and can be exported/imported.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-slate-200">
            <Badge label="Total" value={stats.total} />
            <Badge label="Active" value={stats.active} />
            {categories.length > 0 && <Badge label="Categories" value={categories.length} />}
          </div>
        </header>

        {message && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-100 text-sm">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search words, hints, categories"
                  className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white w-full md:w-80"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={downloadExport}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition"
                >
                  Export JSON
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition"
                >
                  Import JSON
                </button>
                <button
                  onClick={async () => {
                    await reset()
                    setMessage('Reset to seed applied')
                  }}
                  className="px-3 py-2 rounded-lg bg-amber-500 text-slate-900 font-semibold hover:bg-amber-400 transition"
                >
                  Reset to Seed
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImport(file)
                    e.target.value = ''
                  }}
                  className="hidden"
                />
              </div>
            </div>

            <WordTable
              words={payload.words}
              search={search}
              onEdit={(word) => setEditing(word)}
              onDelete={(id) => {
                deleteWord(id)
                setMessage('Word removed')
              }}
              onToggle={(id) => toggleActive(id)}
            />
          </div>

          <div className="space-y-4">
            <WordForm
              initial={editing ?? undefined}
              onSubmit={editing ? handleUpdate : handleAdd}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>
      </div>
    </main>
  )
}

function Badge({ label, value }: { label: string; value: number | string }) {
  return (
    <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-100 border border-slate-700">
      {label}: <span className="font-semibold">{value}</span>
    </span>
  )
}
