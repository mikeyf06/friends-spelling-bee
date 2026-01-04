import type { AttemptRecord } from '../lib/types'

type AttemptHistoryProps = {
  attempts: AttemptRecord[]
  onClear?: () => void
}

export function AttemptHistory({ attempts, onClear }: AttemptHistoryProps) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Recent Attempts</h3>
        {attempts.length > 0 && onClear && (
          <button
            onClick={onClear}
            className="text-sm text-slate-200 hover:text-white underline"
          >
            Clear
          </button>
        )}
      </div>
      <ul className="space-y-2 max-h-64 overflow-y-auto pr-2">
        {attempts.slice(0, 50).map((attempt) => (
          <li
            key={attempt.id}
            className="flex flex-col gap-1 rounded-lg bg-slate-800/50 p-3 border border-slate-800"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-100 font-semibold">{attempt.expected}</span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  attempt.correct ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-200'
                }`}
              >
                {attempt.correct ? 'Correct' : 'Incorrect'}
              </span>
            </div>
            <div className="text-sm text-slate-300 flex items-center justify-between gap-2">
              <span>
                Attempt: <span className="font-medium text-white">{attempt.attempt || '—'}</span>
              </span>
              {attempt.teamName && (
                <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-100 border border-slate-600">
                  {attempt.teamName}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                {new Date(attempt.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {attempt.hint && <span className="truncate max-w-[50%]">Hint: {attempt.hint}</span>}
            </div>
          </li>
        ))}
        {attempts.length === 0 && (
          <li className="text-sm text-slate-300">No attempts yet. Start playing to see history.</li>
        )}
      </ul>
    </div>
  )
}
