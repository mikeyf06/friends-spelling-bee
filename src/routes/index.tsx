import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import { AttemptHistory } from '../components/AttemptHistory'
import { GameCard } from '../components/GameCard'
import { getActiveWords, useWords } from '../lib/wordsStore'
import { useSettings } from '../lib/settings'
import type { AttemptRecord, Team } from '../lib/types'

export const Route = createFileRoute('/')({ component: GameScreen })

function GameScreen() {
  const { payload, loading, error } = useWords()
  const { settings } = useSettings()
  const [attempts, setAttempts] = useState<AttemptRecord[]>([])
  const [teams, setTeams] = useState<Team[]>([
    { id: 'team-1', name: 'Team A' },
    { id: 'team-2', name: 'Team B' },
  ])
  const [currentTeamId, setCurrentTeamId] = useState<string | null>('team-1')
  const [newTeamName, setNewTeamName] = useState('')

  const activeWords = useMemo(() => {
    if (!payload) return []
    let words = getActiveWords(payload.words)
    if (settings.filters.category) {
      words = words.filter(
        (word) => word.category?.toLowerCase() === settings.filters.category?.toLowerCase(),
      )
    }
    if (settings.filters.difficulty) {
      words = words.filter(
        (word) => !word.difficulty || word.difficulty === settings.filters.difficulty,
      )
    }
    return words
  }, [payload, settings.filters.category, settings.filters.difficulty])

  const stats = useMemo(() => {
    const attempted = attempts.length
    const correct = attempts.filter((a) => a.correct).length
    const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0
    return { attempted, correct, accuracy }
  }, [attempts])

  const teamStats = useMemo(() => {
    const base = Object.fromEntries(teams.map((team) => [team.id, { correct: 0, attempted: 0 }]))
    attempts.forEach((attempt) => {
      if (!attempt.teamId || !base[attempt.teamId]) return
      base[attempt.teamId].attempted += 1
      if (attempt.correct) base[attempt.teamId].correct += 1
    })
    return base
  }, [attempts, teams])

  const currentTeam = teams.find((t) => t.id === currentTeamId) ?? null

  const onAttempt = (attempt: AttemptRecord) => {
    setAttempts((prev) => [attempt, ...prev].slice(0, 50))
  }

  const addTeam = () => {
    const name = newTeamName.trim()
    if (!name) return
    const id = crypto.randomUUID()
    const nextTeams = [...teams, { id, name }]
    setTeams(nextTeams)
    setNewTeamName('')
    if (!currentTeamId) setCurrentTeamId(id)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-lg text-slate-200">Loading words...</p>
      </main>
    )
  }

  if (error || !payload) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-lg text-rose-200">Something went wrong. Please refresh.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase text-slate-400 tracking-wide">Play</p>
              <h1 className="text-3xl font-black">Spelling Bee for Friends</h1>
              <p className="text-slate-300 text-sm">
                Words are stored locally; manage them in Admin, tune speech in Settings.
              </p>
            </div>
            <div className="flex gap-3">
              <Stat label="Active Words" value={activeWords.length} />
              <Stat label="Attempted" value={stats.attempted} />
              <Stat label="Accuracy" value={`${stats.accuracy}%`} />
            </div>
          </div>
          {activeWords.length === 0 && (
            <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-100 flex items-center justify-between">
              <span>No active words yet. Add some in the admin panel.</span>
              <Link
                to="/admin"
                className="px-3 py-2 rounded bg-amber-500 text-slate-900 font-semibold hover:bg-amber-400"
              >
                Go to Admin
              </Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase text-slate-400">Teams</p>
                    <h2 className="text-xl font-semibold text-white">Choose who is up</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="Add team"
                      className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                    />
                    <button
                      onClick={addTeam}
                      className="px-3 py-2 rounded-lg bg-cyan-500 text-white font-semibold hover:bg-cyan-600 transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => setCurrentTeamId(null)}
                  className={`w-full text-left p-3 rounded-lg border ${
                    currentTeamId === null
                      ? 'border-cyan-500/60 bg-cyan-500/10'
                      : 'border-slate-800 bg-slate-900/40'
                  } hover:border-cyan-500/60 transition`}
                >
                  <div className="flex items-center justify-between text-sm text-white">
                    <span className="font-semibold">No team (solo)</span>
                  </div>
                </button>
                {teams.map((team) => {
                  const stats = teamStats[team.id] ?? { attempted: 0, correct: 0 }
                  const accuracy = stats.attempted
                    ? Math.round((stats.correct / stats.attempted) * 100)
                    : 0
                  return (
                    <button
                      key={team.id}
                      onClick={() => setCurrentTeamId(team.id)}
                      className={`p-3 rounded-lg border ${
                        team.id === currentTeamId
                          ? 'border-cyan-500/60 bg-cyan-500/10'
                          : 'border-slate-800 bg-slate-900/40'
                      } hover:border-cyan-500/60 transition text-left`}
                    >
                      <div className="flex items-center justify-between text-sm text-white">
                        <span className="font-semibold">{team.name}</span>
                        <span className="text-xs text-slate-300">
                          {stats.correct}/{stats.attempted} · {accuracy}%
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <GameCard
              words={activeWords}
              settings={settings}
              onAttempt={onAttempt}
              team={currentTeam}
            />
          </div>
          <div className="space-y-4">
            <AttemptHistory attempts={attempts} onClear={() => setAttempts([])} />
          </div>
        </div>
      </div>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="px-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700">
      <p className="text-xs uppercase text-slate-400">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  )
}
