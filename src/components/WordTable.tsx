import type { Word } from '../lib/types'

type WordTableProps = {
  words: Word[]
  search: string
  onEdit: (word: Word) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
}

export function WordTable({ words, search, onEdit, onDelete, onToggle }: WordTableProps) {
  const filtered = words.filter((word) => {
    const haystack = `${word.word} ${word.hint ?? ''} ${word.category ?? ''}`.toLowerCase()
    return haystack.includes(search.toLowerCase())
  })

  return (
    <div className="overflow-x-auto bg-slate-900/50 border border-slate-800 rounded-xl">
      <table className="min-w-full text-left">
        <thead className="bg-slate-800/60 text-slate-200 text-sm uppercase tracking-wide">
          <tr>
            <th className="px-4 py-3">Active</th>
            <th className="px-4 py-3">Word</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Difficulty</th>
            <th className="px-4 py-3">Hint</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 text-sm">
          {filtered.map((word) => (
            <tr key={word.id} className="hover:bg-slate-800/30">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={word.active !== false}
                  onChange={() => onToggle(word.id)}
                  className="rounded border-slate-600"
                />
              </td>
              <td className="px-4 py-3 font-semibold text-white">{word.word}</td>
              <td className="px-4 py-3 text-slate-200">{word.category || '—'}</td>
              <td className="px-4 py-3 text-slate-200">{word.difficulty ?? '—'}</td>
              <td className="px-4 py-3 text-slate-300 max-w-xs">{word.hint || '—'}</td>
              <td className="px-4 py-3 text-right space-x-2">
                <button
                  onClick={() => onEdit(word)}
                  className="px-3 py-1 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(word.id)}
                  className="px-3 py-1 rounded-lg bg-rose-600 text-white hover:bg-rose-500 transition"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td className="px-4 py-4 text-slate-300" colSpan={6}>
                No words found. Try adjusting your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
