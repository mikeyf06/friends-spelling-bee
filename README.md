## Spelling Bee for Friends

A client-only TanStack Start app for running a team-based spelling bee. Words seed from `public/words.json`, edits persist in `localStorage`, and you can import/export JSON for backups.

### Requirements
- Node >= 22.12
- Yarn 1.x

### Install & Run
```bash
cd friends-spelling-bee
yarn install
yarn dev     # http://localhost:3000
```

Build/preview:
```bash
yarn build
yarn preview
```

### Routes
- `/` Game: pick a team (clickable cards), host can show/hide the current word, play with TTS, see attempt history and per-team stats.
- `/admin` Word bank: search, add/edit/delete/toggle active, import/export JSON, reset to seed.
- `/settings` Voices and selection: choose speech voice/rate/pitch, selection mode (random/sequential/no-repeats), and filters (category/difficulty).

### Data & Persistence
- Seed: `public/words.json` (replace with your list).
- Local storage keys: `spellingBee.words.v1`, `spellingBee.settings.v1`.
- Edits/import/export stay in the browser; reset uses the seed.

### Notes
- TTS uses the browser’s SpeechSynthesis voices; on macOS you can install better voices in System Settings and they’ll appear in the dropdown.
- Teams are stored in-memory per session; attempts are tagged with the selected team.
