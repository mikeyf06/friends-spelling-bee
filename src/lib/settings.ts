import { useEffect, useState } from 'react'

import type { GameSettings } from './types'

const SETTINGS_KEY = 'spellingBee.settings.v1'
const isBrowser = typeof window !== 'undefined'

const DEFAULT_SETTINGS: GameSettings = {
  rate: 1,
  pitch: 1,
  selectionMode: 'random',
  filters: {},
}

export function loadSettings(): GameSettings {
  if (!isBrowser) return DEFAULT_SETTINGS
  const raw = window.localStorage.getItem(SETTINGS_KEY)
  if (!raw) return DEFAULT_SETTINGS
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as GameSettings) }
  } catch (error) {
    console.error('Failed to parse settings', error)
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: GameSettings) {
  if (!isBrowser) return
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function useSettings() {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  return {
    settings,
    updateSetting: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) =>
      setSettings((prev) => ({ ...prev, [key]: value })),
    updateFilters: (filters: GameSettings['filters']) =>
      setSettings((prev) => ({ ...prev, filters })),
    updateSettings: (partial: Partial<GameSettings>) =>
      setSettings((prev) => ({
        ...prev,
        ...partial,
        filters: { ...prev.filters, ...(partial.filters ?? {}) },
      })),
  }
}
