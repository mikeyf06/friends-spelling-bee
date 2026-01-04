import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
            SB
          </div>
          <div>
            <p className="text-white font-semibold">Spelling Bee for Friends</p>
            <p className="text-xs text-slate-400">Play · Manage · Share</p>
          </div>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link
            to="/"
            className="text-slate-200 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800"
            activeProps={{ className: 'bg-cyan-600 text-white px-3 py-2 rounded-lg' }}
          >
            Game
          </Link>
          <Link
            to="/admin"
            className="text-slate-200 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800"
            activeProps={{ className: 'bg-cyan-600 text-white px-3 py-2 rounded-lg' }}
          >
            Admin
          </Link>
          <Link
            to="/settings"
            className="text-slate-200 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800"
            activeProps={{ className: 'bg-cyan-600 text-white px-3 py-2 rounded-lg' }}
          >
            Settings
          </Link>
        </nav>
      </div>
    </header>
  )
}
