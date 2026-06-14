# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Vite, hot reload)
npm run build    # Production build
npm run preview  # Preview production build locally
```

No test suite or linter is configured.

## Architecture

**Portfolio Command** is a single-page React app for managing a real estate portfolio. All state lives in a single React Context (`PC`) defined in `App.jsx` and consumed via `usePC()`. There is no router — navigation is handled by a `view` state variable (`'dashboard'` | `'property'` | `'workers'`).

### Data flow

All application data (properties + workers) is stored in **one Firestore document**: `portfolio/main`. The full document is read on mount, held in memory, and written back wholesale on every change via `saveData()` in `firebase.js`. There is no partial update — every mutation replaces the entire document. `localStorage` (`portfolio_backup`) is a fallback only; it is not the source of truth.

The `justSaved` ref in `App.jsx` prevents the Firestore `onSnapshot` listener from overwriting local state immediately after a write.

### Key files

| File | Role |
|---|---|
| `src/App.jsx` | Global state, auth, Firestore sync, all CRUD functions, `PC` context provider |
| `src/data.js` | Constants (`PRIORITY`, `STATUS`, `CHECKLIST_ITEMS`, etc.), financial calculators (`calcNOI`, `calcEquity`, `calcRehabLeft`), `uid()` counter, `seedData()` |
| `src/theme.jsx` | `ThemeProvider` + `useTheme()` hook; exports `btn(variant, t)`, `inp(t)`, `card(t)` inline-style helpers |
| `src/firebase.js` | Firebase init, `saveData()`, `subscribeToData()`, auth helpers |

### Styling convention

All styling is **inline CSS objects** — no CSS files, no Tailwind. Reusable style fragments come from `theme.jsx`: `btn(variant, t)` returns a style object for one of five button variants (`default` | `gold` | `green` | `red` | `dark`). The theme token object `t` (from `useTheme()`) must be passed to these helpers. Always destructure `const { t } = useTheme()` at the top of any component that needs styles.

### Property data shape

Each property in `data.properties` is a flat object with fields grouped by tab: `tasks[]`, `checklist{}`, `parcels[]`, `photos[]`, `drawings[]`, `docs[]`, `notes`, `strategies[]`, `financials{}`. New records are built with the `new*()` factory functions in `data.js` (e.g., `newTask()`, `newParcel()`). All monetary inputs are stored as raw strings and parsed at render time with `parseDollar()` / `fmt$()`.

### Adding a new tab

1. Create `SomethingTab.jsx` consuming `usePC()` and `useTheme()`.
2. Add the tab label to the `TABS` array in `PropertyDetail.jsx`.
3. Add the corresponding `case` in `PropertyDetail`'s tab render switch.
4. Add any new fields to the property default in `data.js`.
