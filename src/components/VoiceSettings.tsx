import type { GameSettings } from '../lib/types'

type VoiceSettingsProps = {
  voices: SpeechSynthesisVoice[]
  settings: GameSettings
  onChange: (settings: Partial<GameSettings>) => void
}

export function VoiceSettings({ voices, settings, onChange }: VoiceSettingsProps) {
  return (
    <div className="space-y-4 bg-slate-900/50 border border-slate-800 rounded-xl p-4">
      <div>
        <label className="block text-sm text-slate-200 mb-2">Voice</label>
        <select
          value={settings.voiceURI ?? ''}
          onChange={(e) => onChange({ voiceURI: e.target.value || undefined })}
          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
        >
          <option value="">Default voice</option>
          {voices.map((voice) => (
            <option key={voice.voiceURI} value={voice.voiceURI}>
              {voice.name} {voice.lang ? `(${voice.lang})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col text-sm text-slate-200 gap-2">
          Rate: {settings.rate.toFixed(2)}
          <input
            type="range"
            min={0.5}
            max={1.5}
            step={0.05}
            value={settings.rate}
            onChange={(e) => onChange({ rate: Number(e.target.value) })}
          />
        </label>

        <label className="flex flex-col text-sm text-slate-200 gap-2">
          Pitch: {settings.pitch.toFixed(2)}
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.05}
            value={settings.pitch}
            onChange={(e) => onChange({ pitch: Number(e.target.value) })}
          />
        </label>
      </div>
    </div>
  )
}
