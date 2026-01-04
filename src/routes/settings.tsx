import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'

import { VoiceSettings } from '../components/VoiceSettings'
import { useSettings } from '../lib/settings'
import type { SelectionMode } from '../lib/types'
import { isSpeechSupported, useVoices } from '../lib/tts'
import { getActiveWords, useWords } from '../lib/wordsStore'

export const Route = createFileRoute('/settings')({ component: SettingsScreen })

const selectionModes: { label: string; value: SelectionMode; description: string }[] = [
  { label: 'Random', value: 'random', description: 'Pick any active word each turn' },
  { label: 'Sequential', value: 'sequential', description: 'Walk through the list in order' },
  {
    label: 'No repeats',
    value: 'no-repeats',
    description: 'Shuffle the list and avoid repeats until every word has been used',
  },
]

function SettingsScreen() {
  const { settings, updateSetting, updateFilters, updateSettings } = useSettings()
  const { payload } = useWords()
  const voices = useVoices()
  const supported = isSpeechSupported()

  const categories = useMemo(() => {
    if (!payload) return []
    const active = getActiveWords(payload.words)
    return Array.from(new Set(active.map((w) => w.category).filter(Boolean))).sort()
  }, [payload])

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase text-slate-400 tracking-wide">Settings</p>
          <h1 className="text-3xl font-black">Voice & Game Tuning</h1>
          <p className="text-slate-300 text-sm">
            Choose how words are selected and how the speech synthesizer reads them aloud.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
              <h2 className="text-xl font-semibold">Selection Mode</h2>
              <div className="space-y-2">
                {selectionModes.map((mode) => (
                  <label
                    key={mode.value}
                    className="flex items-start gap-3 p-3 rounded-lg border border-slate-800 hover:border-cyan-500/40 bg-slate-950/50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="selection-mode"
                      value={mode.value}
                      checked={settings.selectionMode === mode.value}
                      onChange={() => updateSetting('selectionMode', mode.value)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-semibold text-white">{mode.label}</p>
                      <p className="text-sm text-slate-300">{mode.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
              <h2 className="text-xl font-semibold">Filters</h2>
              <div className="space-y-3">
                <label className="block text-sm text-slate-200">
                  Category
                  <select
                    value={settings.filters.category ?? ''}
                    onChange={(e) =>
                      updateFilters({
                        ...settings.filters,
                        category: e.target.value || undefined,
                      })
                    }
                    className="mt-2 w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="">All categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm text-slate-200">
                  Difficulty (exact match)
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={settings.filters.difficulty ?? ''}
                    onChange={(e) =>
                      updateFilters({
                        ...settings.filters,
                        difficulty: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="mt-2 w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                    placeholder="Any"
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Voice</h2>
                {!supported && (
                  <span className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-100 border border-amber-500/30">
                    Speech API unavailable
                  </span>
                )}
              </div>
              <VoiceSettings voices={voices} settings={settings} onChange={updateSettings} />
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
