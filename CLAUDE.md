# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Vite, hot reload)
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
```

No test suite, linter, or typecheck is configured. `npm run build` is the only automated check available.

## What is actually part of this app

The shipped app is **only** `index.html` + `src/` + `vite.config.js` + root `package.json`. Vite's entry is `index.html`, which loads `/src/main.jsx`.

Everything else at the top level is dead weight from an abandoned Replit scaffold and is excluded from the deploy via `.vercelignore`. **Do not edit these, and do not trust them as documentation:**

| Path | What it really is |
|---|---|
| `replit.md` | Unfilled Replit template. Describes a pnpm/Express/Postgres/Drizzle stack that **does not exist here**. Ignore it entirely. |
| `tsconfig.json` / `tsconfig.base.json` | Reference `lib/*` projects. There is no TypeScript in the app — it is plain JSX. |
| `artifacts/`, `lib/`, `scripts/` | Replit scaffold packages (Express API, mockup sandbox, codegen). Unused. |
| `portfolio/` | A **separate, unrelated Vite React app** vendored into this repo. Not imported by `src/`. |
| `src/package.json` | Stale Create-React-App leftover (`react-scripts`). The real manifest is the **root** `package.json`. |
| `src/public/index.html`, `public/src/` | Leftovers. The real static dir is root `public/` (holds `manifest.json`). |
| `setup_portfolio.py`, `dist.tar.gz`, `temp-repo` | Stray artifacts. |

If a task seems to call for touching any of the above, you are almost certainly in the wrong place.

## Architecture

Single-page React app for managing a real estate portfolio. All state lives in one React Context (`PC`) defined in `App.jsx` and consumed via `usePC()`. There is no router — navigation is a `view` state variable (`'dashboard'` | `'property'` | `'workers'`).

### Data flow

All application data (properties + workers) is stored in **one Firestore document**: `portfolio/main`. The document is read on mount via `subscribeToData()`, held in memory, and written back **wholesale** on every change via `saveData()`. There are no partial updates — every mutation replaces the entire document. Every CRUD function in `App.jsx` (`updateProp`, `addProperty`, `deleteProperty`, `updateWorker`, `addWorker`) is a thin wrapper that rebuilds the whole `data` object and hands it to `persist()`.

Two consequences worth internalizing:
- Concurrent edits from two clients last-write-wins the *entire portfolio*, not just the edited field.
- The `justSaved` ref in `App.jsx` suppresses the incoming `onSnapshot` for **1200 ms** after a write, so local state isn't clobbered by the echo of your own save. If you add an async write path, respect this flag or you'll reintroduce state flicker.

`localStorage` (`portfolio_backup`) is **not** a general cache: it is written only inside `saveData()`'s `catch` (i.e. when Firestore rejects) and read only in the subscribe error handler. If Firestore is reachable, localStorage is never touched.

If the Firestore doc doesn't exist, `seedData()` from `data.js` is written to it on first load.

### Key files

| File | Role |
|---|---|
| `src/App.jsx` | Global state, auth gate, Firestore sync, all CRUD, `PC` context provider, header stats |
| `src/data.js` | Constants, `def*()` factories, financial calculators, `uid()`, `seedData()` |
| `src/theme.jsx` | `ThemeProvider` + `useTheme()`; exports `btn()`, `inp()`, `card()` style helpers |
| `src/firebase.js` | Firebase init, `saveData()`, `subscribeToData()`, auth helpers |
| `src/PropertyDetail.jsx` | Property header + the 10-tab bar; each tab is its own `*Tab.jsx` |

### Styling convention

All styling is **inline CSS objects** — no CSS files, no Tailwind, no `className`. Reusable fragments come from `theme.jsx`. Always destructure `const { t } = useTheme()` at the top of any component that needs styles.

**The theme token object `t` is the FIRST argument** to every helper:

```js
btn(t)            // default variant
btn(t, 'gold')    // 'default' | 'gold' | 'green' | 'red' | 'dark'
inp(t)
card(t)
```

Getting the argument order backwards (`btn('gold', t)`) fails **silently** — you get an object with `undefined` colors rather than an error. Watch for this.

Dark mode is driven entirely by `prefers-color-scheme` via a `matchMedia` listener in `ThemeProvider`. There is no manual toggle, and `t` swaps wholesale between the `light` and `dark` token objects. `useTheme()` returns `{ t, isDark }`.

### Property data shape

Each property in `data.properties` is a flat object built by `defProperty(id, name, location)`:

```
id, name, location, zone, strategy, notes
tasks[]  checklist[]  parcels[]  photos[]  drawings[]  docs[]  strategies[]  neighbors[]
financials{}
```

Note `checklist` is an **array** (one entry per `CHECKLIST_ITEMS` row, each with `done` / `na` / `note`), not a keyed object.

Factories in `data.js` are named `def*()`, **not** `new*()`: `defProperty`, `defChecklist`, `defFinancials`, `defStrategy`, `defParcel`, `defDrawing`, `defWorker`. There is **no** task or photo factory — `TasksTab` and `PhotosTab` build those records inline (`{ id: uid(), ...form, status: 'todo' }`). If you add fields to a task, grep for the inline literals rather than looking for a factory.

All monetary values are stored as **raw strings** exactly as typed (`'$3,500–$7,000'` is a legal value) and parsed only at render time via `parseDollar()` / `fmt$()`, which strip everything non-numeric and return `null` when unparseable. Never assume a financial field is a number.

`uid()` returns a `crypto.randomUUID()` string. It was previously a module-level counter that reset to `1000` on every page load, which meant the Nth record created in *any* session always got the same id — colliding with records already persisted in Firestore. Because tasks, parcels and drawings are updated and deleted **by id** within an array, duplicates edited and deleted each other. Do not reintroduce a counter here.

Records written before that fix may still hold colliding numeric ids (`"1001"`, `"1002"`, …); the seed originally consumed `1001`–`1082`. A repair pass over the live document has **not** been run.

### Adding a new tab

1. Create `SomethingTab.jsx` consuming `usePC()` and `useTheme()`; it receives `prop` and `updateProp` as props from `PropertyDetail`.
2. Add the tab to the `TABS` array in `PropertyDetail.jsx`.
3. Add the matching line to the render block at the bottom of `PropertyDetail` (it's a list of `&&` conditionals, not a `switch`).
4. Add any new fields to `defProperty()` in `data.js` so existing records get them.

Existing records in Firestore **will not** have your new field — every tab defensively falls back (`(prop.photos || [])`). Do the same.

### Known gaps

- The **Workers** view is a placeholder stub (`WorkersPlaceholder` in `App.jsx`, "coming in next update"). `addWorker` / `updateWorker` exist on the context and `seedData()` populates two workers, but no UI consumes them yet.
- The Firebase web config in `src/firebase.js` is committed. That's expected for Firebase web apps (the config is public by design) — access control depends on Firestore security rules plus the email/password auth gate in `Login.jsx`, not on hiding the key.
