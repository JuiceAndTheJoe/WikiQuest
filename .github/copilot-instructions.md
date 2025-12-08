# AI Coding Guide

> Project-specific rules for AI agents. Targets **grade A** requirements per DH2642 grading criteria.

## 1. Architecture Snapshot (Grade A Requirements)

- React + Vite (port `8080`, HMR). Material UI for styling via `ThemeProvider` in `ReactRoot.jsx`.
- **State Manager**: Redux Toolkit (`src/app/store.js`) with combined reducers in `rootReducer.js`. All application state side effects (persistence) go through Redux middleware.
- **Zero concern mixing**: Persistence → Application State (Redux) → Presenter/Container → View. Each layer is strictly separated.
- Pattern: **Slice (state + pure reducers) → Async thunk (reads) → Middleware (writes/persistence) → View (pure UI)**.
- Firebase (Auth + Firestore) initialized in `src/firebaseConfig.js`. All Firestore access is centralized in `src/app/models/` (`firestoreModel.js`, `leaderboardModel.js`, `gameProgressModel.js`, `userModel.js`).
- **Framework-independent Redux**: Use `connect()` for Redux mappings instead of custom hooks (`useSelector`, `useDispatch`).
- **User-visible third-party components**: Material UI components count. Must have at least one in each major view.
- Component hierarchy: `AppContainer.jsx` (Redux-connected via `connect()`, triggers side effects) wraps `AppPresenter.jsx` (routing + prop passing) which renders per-view Presenters (`HomePresenter.jsx`, `LoginPresenter.jsx`). Each Presenter composes props and manages view-specific UI state, and then renders a pure View (e.g., `HomeView.jsx`, `LoginView.jsx`).
  - **Save/Resume**: `gameProgressModel.js` stores sessions per user at `users/{uid}/sessions/game` with `savedAt`; `gameSlice.loadSavedGame` thunk reads; persistence middleware writes after start/hint/guess and clears on game over.

## 2. Dev & Build Workflow

- Start dev: `npm run dev` (Vite, sourcemaps on).
- Production build: `npm run build` → outputs to `dist/` (referenced by `firebase.json`).
- Preview build locally: `npm run serve`.
- Deploy: `firebase deploy` (already configured to host `dist`).
- Lint: `npm run lint` (ESLint flat config in `eslint.config.js`).
- Format: `npm run format` (Prettier using `.prettierrc` / `.prettierignore`).

## 3. State & Side Effects Rules

- Reducers must remain pure; **no direct Firestore calls inside slices or components**.
- Remote reads use `createAsyncThunk` (example: `fetchLeaderboard` in `gameSlice.js`).
- Remote writes/persistence occur in `persistenceMiddleware.js` after actions mutate state (example: persisting `lastGameResult` summaries to Firestore, saving in-progress sessions, clearing saved state on game over).
- Disable serializable check already configured (Firestore snapshots may include non-serializable data).
- **Live updates (grade A+)**: Use `onSnapshot` subscriptions in `firestoreModel.js` to dispatch actions when remote data changes. Users running multiple app instances see the same data in real-time.
  - **Auto-save triggers**: middleware saves current game state after `startNewGame`, `useHint`, and every `submitGuess`. It sets `hasSavedGame` true on success. When `lastGameResult.endedAt` appears, middleware clears the saved session and persists the result.

## 4. Firestore Usage Pattern (Grade A Requirements)

- All Firestore document logic lives in `src/app/models/` (e.g., `saveGameResult`, `getLeaderboard`, `saveUserData`, `saveCurrentGameState`).
- **Authentication required**: All persisted data must be separated per authenticated user. Use Firebase Auth (`src/firebaseConfig.js`) to get user ID.
- User-specific data: `users/{userId}` documents store aggregated stats (`gamesPlayed`, `totalScore`, `accuracy`, etc.). Pattern: `users/{userId}/...` for related collections if needed.
- **Live updates**: `subscribe*` functions implemented using `onSnapshot` for real-time sync. Ready to connect to Redux via container components.
- **Current Firestore functions**:
  - `saveGameResult(userId, summary, profile)` - Transactionally updates leaderboard aggregates per user
  - `getLeaderboard(maxCount)` - Reads global leaderboard ordered by `highScore`
  - `saveUserData(userId, data)` - Generic user data save
  - `getUserData(userId)` - Generic user data read
  - `subscribeToUserData(userId, callback)` - Generic user data subscription
  - `saveCurrentGameState(userId, gameState)` - Saves in-progress run to `users/{uid}/sessions/game`
  - `loadSavedGameState(userId)` / `hasSavedGame(userId)` - Reads saved session snapshot
  - `clearSavedGameState(userId)` - Removes saved session (on completed runs)
- **External APIs**: Centralize every integration inside dedicated model files (e.g., `mediaWikiModel.js`). Current Wikipedia usage relies solely on the lightweight summary endpoint for hints; add additional sources only when there is a clear UX requirement.
- **Collaborative features (grade A+)**: For shared state where user actions complement each other, handle conflicts via Firestore transactions or optimistic UI updates with rollback.

## 5. Adding a New Feature Slice (Example Steps)

1. Create `src/app/features/<feature>/<featureSlice>.js` with `createSlice` + optional thunks.
2. Export actions & reducer; register reducer in `rootReducer.js`.
3. For persisted writes: extend `persistenceMiddleware.js` with a conditional on the new action types.
4. For reads on mount: dispatch new thunk from a container (`useEffect` in `AppContainer.jsx` or a feature-specific container). Do not fetch in views.

### Current Feature Slices

- **`authSlice.js`**: Manages user authentication state (`user`, `loading`, `error`, `isAuthChecked`). Includes async thunks for login, register, logout. Auth listener initialized in `AppContainer`.
- **`gameSlice.js`**: Owns all gameplay state (levels, lives, scores, hints, per-question logs, leaderboard data). Async thunks fetch leaderboard data; reducers stay pure while middleware handles persistence.
- **`wikipediaSlice.js`**: Manages Wikipedia summary data (`pageData`, `loading`, `error`). Fetches a single summary payload; presenters split/redact sentences as needed for hints.

## 6. Presenter / View Convention

- Containers (`*Container.jsx`) connect Redux (`connect(...)`) – continue this pattern instead of mixing hooks for consistency.
- App-level presenter: `AppPresenter.jsx` handles routing only (no business logic).
- Per-view presenters: `HomePresenter.jsx`, `LoginPresenter.jsx` (and any future `*Presenter.jsx`) manage local view state, derive props (map/shape data), and wire callbacks. They do not perform side effects (those stay in containers/middleware).
- Views (`HomeView.jsx`, `LoginView.jsx`) remain stateless/pure and only render props.
- Reusable UI elements (e.g., `PrimaryButton.jsx`) stay logic-free.

## 7. Theming & Styling (Grade A Requirements)

- Central theme in `styles/theme.js` (custom palette & typography). Use `sx` prop or theme tokens; avoid ad-hoc inline styles for anything reusable.
- Prefer extending theme over embedding style logic in components.
- **Responsive/mobile-first design (UX prize)**: Use Material UI's responsive breakpoints (`xs`, `sm`, `md`, `lg`, `xl`) in `sx` prop or theme. Design mobile-first if it makes sense for the use case.
- **Feedback on user actions**: All interactive elements must provide visual feedback (loading states, success/error messages, disabled states).
- **Visibility of system status**: Show loading indicators during async operations. Display clear error messages when API calls fail.

## 8. Usability & User Experience (Grade A Requirements)

- **Target group & benefits**: Clearly define target group and benefits. Application functionality must be easy to discover through exploration.
- **User consultation**: Document at least 30 min prototyping session + 30 min formative evaluation with creative improvements from user feedback.
- **Efficient task accomplishment**: Users should complete tasks with minimal steps.
- **User in control**: Provide undo/cancel options, allow users to perform other actions while waiting for async operations.
- **Originality (UX prize)**: App idea should be beyond state of art, not just "dinner planner in disguise".

## 9. Example Data Flow

### Authentication Flow

App mounts → `initAuthListener` called in `AppContainer` → `onAuthStateChanged` listener fires → `setUser` action dispatched → auth state updated → routes re-render based on `user` state → once authenticated, containers dispatch any required thunks (e.g., `fetchLeaderboard`) using the signed-in user's ID.

### Login/Registration Flow

User submits form → `LoginView` calls `onLogin`/`onRegister` → `AppContainer` dispatches `loginUser`/`registerUser` thunk → Firebase Auth API called → on success, user object stored in Redux → `onAuthStateChanged` listener fires → routes redirect to home → containers load user-specific data (leaderboard, saved progress) as needed.

### Game & Leaderboard Flow

User starts a run → `startNewGame` initializes level/lives and requests Wikipedia data for the first celeb via `GameContainer` → each guess dispatches `submitGuess`, which records per-question stats (`scoreDelta`, `hintsUsed`) while keeping reducers pure → when the run ends (`lives` reach 0), `gameSlice` stores `lastGameResult`; middleware detects the new summary and calls `saveGameResult` to update the global leaderboard → `fetchLeaderboard` loads the latest global rankings for `LeaderboardPresenter`.

### Save & Resume Flow

User logs in → `HomeContainer` dispatches `loadSavedGame(userId)` to detect saved sessions → `GameContainer` attempts `loadSavedGame` on mount; if none exists, it starts `startNewGame` → middleware auto-saves after start/hint/guess into `users/{uid}/sessions/game` and sets `hasSavedGame` → `HomeView` shows **Resume Game** CTA based on `hasSavedGame` → when a run ends, middleware clears the saved session and persists `lastGameResult` to the leaderboard.

### Wikipedia API Flow

App mounts → `AppContainer` dispatches `fetchWikipediaPage` thunk → `getPageSummary` called in `mediaWikiModel.js` → Wikipedia REST API returns JSON summary data → state updates with `{ summary }` → presenters derive any hint text locally before passing it to the views.

## 10. Debugging & Tooling

- Sourcemaps enabled; build `minify: false` to ease Firebase-hosted debugging.
- ESLint configured via flat config (`eslint.config.js`) with React, JSON, Markdown and CSS plugins plus `eslint-config-prettier` to avoid style conflicts.
- Prettier configured via `.prettierrc` (with `.prettierignore`) and run through `npm run format`.
- Fire-and-forget writes: middleware catches errors via `console.warn`; for production, evolve into dispatching an error slice/action.

## 11. Usage of external code

- Always use Context7 when asked for code generation, setup or configuration steps, or library/API documentation. This means you should automatically use the Context7 MCP tools to resolve library id and get library docs without having to be explicitly asked. If Context7 is not available, you can proceed without it without mentioning it.

## 12. Guardrails for AI Changes (Grade A Compliance)

- **Zero concern mixing**: Do NOT introduce Firestore logic directly into components or slices—always route through model + middleware.
- Preserve the Container/Presenter/View layering; new routes belong in `AppPresenter.jsx`.
- Keep middleware side effects idempotent (derive data from current state, not previous assumptions).
- Limit slice state to serializable primitives; computed/derived values should be recalculated in selectors (if added later).
- **Authentication gates**: All persistence operations must check user authentication status first. Currently implemented: middleware checks `state.auth.user?.uid` before persisting; `AppPresenter` uses route guards (`<Navigate>`) to redirect unauthenticated users to `/login`; `AppContainer` only fetches user data when `user?.uid` exists.
- **One role per view**: Each view component should have a single, clear responsibility. Don't mix sidebar + summary in one component.
- API Integration: Always use context7 (if avalible) when asked for code generation, setup or configuration steps, or library/API documentation. This means you should automatically use the Context7 MCP tools (if avalible) to resolve library id and get library docs without having to be explicitly asked.
- **Save/Resume guardrails**: Do not bypass middleware for persistence. Use `loadSavedGame` thunk for reads, `saveCurrentGameState` only inside middleware. Keep `hasSavedGame` flag in Redux and show resume CTAs via presenters/views; do not trigger Firestore writes from views/components or slices.

## 13. Safe Extension Checklist (Grade A Compliance)

Before committing a change:

- Added slice? Registered in `rootReducer.js`.
- Added persistence? Middleware updated, no side effects in reducers/components. User authentication checked.
- Added remote read? Implemented thunk + dispatched from container.
- Added UI element? Pure & receives all data via props. Includes loading/error states.
- Added new view? Single clear role, one module per view, uses Material UI components.
- Added new presenter? Ensure each view has a matching `*Presenter.jsx` that holds all view logic/state; do not put logic in views.
- Added API integration? Centralized in model file, provides clear system status feedback.
- **Grade A extras**: Live updates via `onSnapshot`? Multi-source API mashup? Collaborative features with conflict handling?

---

**Project Goal**: Grade A per DH2642 criteria. Focus on: strict separation of concerns, authentication, responsive design, user consultation documentation, and creative UX beyond state of art.
