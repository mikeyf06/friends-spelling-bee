# Spelling Bee Web App (TanStack Start) — Agent Build Instructions

**Goal:** Build a “Spelling Bee for Friends” web app where an admin can **add/edit/delete** words (stored in a JSON seed) and players can attempt spellings, submit, and instantly see if they’re correct.

This spec intentionally keeps the app **static-host friendly** (Netlify/Vercel). Because a deployed frontend can’t reliably write back to a JSON file at runtime, the app will:

- **Load an initial seed** list from a JSON file in `/public/words.json`
- **Persist changes** (add/edit/delete) in `localStorage` (or IndexedDB if you prefer)
- Provide **Import/Export JSON** so you can backup/share the word list or “reset” to the seed

---

## Tech Requirements

- Framework: **TanStack Start**
- Package manager: **Yarn**
- Data source: **JSON seed** in `/public/words.json`
- Editable word list: stored client-side (localStorage) + import/export JSON
- UI: simple, clean, mobile-friendly

---

## App Features

### 1) Word Bank (Admin)
Admin can:
- View words list
- Search/filter
- Add new word (+ optional hint/definition/category/difficulty)
- Edit existing word
- Delete word
- Toggle “active” words (only active words can be quizzed)
- Import JSON (replace current)
- Export JSON (download current)

**Optional admin gate:** simple passcode stored in env/localStorage (not security, just friction).

### 2) Spelling Game (Player)
Player flow:
1. App selects a word from the active list.
2. Word is **presented via audio** (Text-to-Speech). Player should not see the correct spelling.
3. Player types the spelling.
4. Player submits.
5. App shows:
   - ✅ Correct / ❌ Incorrect
   - Correct spelling (if incorrect)
   - Optional: hint/definition
6. Tracks session stats:
   - # attempted, # correct, accuracy %
   - history list (last N attempts)

**Important:** Support case-insensitive comparison and trim whitespace. Optionally ignore punctuation for phrases.

### 3) Settings
- Choose voice (if available), rate, pitch (Web Speech API)
- Choose word selection mode:
  - Random
  - Sequential
  - “No repeats until exhausted”
- Choose categories/difficulty filters (if the word objects support them)

---

## Data Model

### `/public/words.json` (seed)
Create a seed file like:

```json
{
  "version": 1,
  "updatedAt": "2026-01-03T00:00:00.000Z",
  "words": [
    {
      "id": "w_001",
      "word": "accommodate",
      "hint": "Provide lodging or space for.",
      "category": "general",
      "difficulty": 3,
      "active": true
    }
  ]
}
```

Notes:
- `id` should be unique and stable (use `crypto.randomUUID()` when creating new items).
- `difficulty` is optional (1–5).
- `active` defaults to `true`.

### Local editable storage
Use one key, e.g.:
- `spellingBee.words.v1`

If local storage is empty, initialize from `/public/words.json`.

---

## Route Map (TanStack Start)

- `/` — Player game screen
- `/admin` — Word bank CRUD
- `/settings` — Game settings

---

## File/Folder Structure (suggested)

```
src/
  routes/
    index.tsx
    admin.tsx
    settings.tsx
  components/
    WordForm.tsx
    WordTable.tsx
    GameCard.tsx
    AttemptHistory.tsx
    VoiceSettings.tsx
  lib/
    wordsStore.ts
    storage.ts
    tts.ts
    utils.ts
public/
  words.json
```

---

## Implementation Steps

### Step 0 — Create project

Run:

```bash
mkdir spelling-bee-for-friends
cd spelling-bee-for-friends
yarn create @tanstack/start
# choose a basic template (keep it simple)
yarn
yarn dev
```

> If the scaffolder asks about SSR vs static, keep defaults. This app can be purely client-based for storage.

---

## Step 1 — Seed JSON

Create `/public/words.json` with a starter set.

Add at least 20 words so it’s testable.

---

## Step 2 — Storage Layer

Create `src/lib/storage.ts`:

- `loadSeedWords(): Promise<WordsPayload>` fetch `/words.json`
- `loadLocalWords(): WordsPayload | null`
- `saveLocalWords(payload: WordsPayload): void`
- `resetToSeed(): Promise<WordsPayload>` (save seed into local, return)

Key points:
- Use `fetch('/words.json')` for the seed.
- Local storage operations must be guarded (only in browser). In TanStack Start routes, ensure calls occur in effects / client context.
- Include a `version` field so you can migrate later.

---

## Step 3 — Words Store

Create `src/lib/wordsStore.ts`:

- Maintain app state for words + settings.
- Minimal approach:
  - `useWords()` hook using React state + effects
  - On mount: load local words, else load seed and save to local
- Expose CRUD functions:
  - `addWord(partial)`
  - `updateWord(id, patch)`
  - `deleteWord(id)`
  - `toggleActive(id)`
  - `importWords(payload)` (replace)
  - `exportWords()` (return payload)

Also expose a selector:
- `getActiveWords(words): Word[]`

---

## Step 4 — Game Logic

Create `src/lib/tts.ts`:

- Use **Web Speech API** (`window.speechSynthesis`)
- `speak(text, options)` where options include `voiceURI`, `rate`, `pitch`, `volume`
- Provide `getVoices()` and handle the common “voices not ready” issue:
  - call `speechSynthesis.getVoices()`
  - listen to `speechSynthesis.onvoiceschanged`

Create `src/components/GameCard.tsx`:

UI elements:
- “Hear word” button
- Optional “Repeat” button
- Input for spelling attempt
- Submit button
- Result area (correct/incorrect)
- “Next word” button

Selection logic:
- Keep `currentWordId`
- When starting session, pick based on selection mode
- Implement “no repeats until exhausted” by keeping a queue/shuffled list

Comparison logic (`src/lib/utils.ts`):
- `normalize(s)`:
  - `trim()`
  - lowercase
  - collapse multiple spaces
  - optionally remove punctuation for phrases
- `isCorrect(attempt, word)` uses normalize and exact match

Attempt history:
- store in state (not necessarily persisted)
- structure: `{ id, wordId, expected, attempt, correct, at }`

---

## Step 5 — Player Route (`/`)

`src/routes/index.tsx`:
- Load words store on client
- If no active words: show a message + link to `/admin`
- Render `GameCard` and `AttemptHistory`
- Show session stats

---

## Step 6 — Admin Route (`/admin`)

Create:
- `src/components/WordForm.tsx` for add/edit
- `src/components/WordTable.tsx` for list + actions

Admin screen requirements:
- Table columns: Active, Word, Category, Difficulty, Hint, Actions
- Actions: Edit, Delete, Toggle Active
- Search box
- “Add word” button opens form
- Import button: upload JSON file → validate → replace current list
- Export button: download JSON file (use Blob + URL.createObjectURL)
- Reset to seed button

Validation:
- `word` required, non-empty
- no duplicates (case-insensitive) unless you allow
- `difficulty` numeric 1–5

---

## Step 7 — Settings Route (`/settings`)

- Voice selection dropdown (show available voices)
- Rate/pitch sliders
- Selection mode radio buttons
- Optional category/difficulty filters

Persist settings in local storage as:
- `spellingBee.settings.v1`

---

## Step 8 — UX polish

- Keyboard support:
  - Enter submits attempt
  - After submit: focus Next or input
- Toasts or inline messages for:
  - saved word
  - deleted word
  - imported/exported
- Mobile friendly layout (single column; large buttons)

---

## Edge Cases to Handle

- `speechSynthesis` not supported → show fallback:
  - show the word (or show “Audio not supported” and allow reveal)
- Empty word list / no active words
- Import JSON malformed
- Duplicate IDs
- Voice list loads after render
- Hydration/client-only: never call `window` APIs during server rendering

---

## Testing Checklist

- Seed loads on first visit
- Adding/editing persists after refresh
- Export produces correct JSON
- Import replaces list correctly
- Reset restores seed
- Game accepts correct spelling (case-insensitive)
- Incorrect spelling shows expected answer
- “No repeats until exhausted” behaves correctly

---

## Stretch Features (Optional)

- Multiplayer “room code” mode (would require backend)
- Per-user accounts (auth) + cloud persistence (Firebase/Supabase)
- Timer mode / pressure mode
- Custom “pronunciation” field (for TTS)
- Alternate answers array (e.g., acceptable spellings)

---

## Definition of Done

- TanStack Start app runs locally via `yarn dev`
- `/public/words.json` seeds initial list
- `/admin` supports full CRUD and import/export/reset
- `/` game mode uses TTS, checks attempts, shows results, tracks session stats
- Works on desktop + mobile

