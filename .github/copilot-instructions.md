# AI Coding Guide

> Project-specific rules for AI agents. Targets **grade A** requirements per DH2642 grading criteria.

## 1. Architecture Snapshot (Grade A Requirements)

- React + Vite (port `8080`, HMR). Material UI for styling via `ThemeProvider` in `ReactRoot.jsx`.
- **State Manager**: Redux Toolkit (`src/app/store.js`) with combined reducers in `rootReducer.js`. All application state side effects (persistence) go through Redux middleware.
- **Zero concern mixing**: Persistence → Application State (Redux) → Presenter/Container → View. Each layer is strictly separated.
- Pattern: **Slice (state + pure reducers) → Async thunk (reads) → Middleware (writes/persistence) → View (pure UI)**.
- Firebase (Auth + Firestore) initialized in `src/firebaseConfig.js`. All Firestore access is centralized in `src/app/firestoreModel.js`.
- **Framework-independent Redux**: Use `connect()` for Redux mappings instead of custom hooks (`useSelector`, `useDispatch`).
- **User-visible third-party components**: Material UI components count. Must have at least one in each major view.
- Component hierarchy: `AppContainer.jsx` (Redux-connected via `connect()`, triggers side effects) wraps `AppPresenter.jsx` (routing + prop passing) which renders Views like `HomeView.jsx` (pure presentational, one role per view, one module per view).

## 2. Dev & Build Workflow

- Start dev: `npm run dev` (Vite, sourcemaps on).
- Production build: `npm run build` → outputs to `dist/` (referenced by `firebase.json`).
- Preview build locally: `npm run serve`.
- Deploy: `firebase deploy` (already configured to host `dist`).

## 3. State & Side Effects Rules

- Reducers must remain pure; **no direct Firestore calls inside slices or components**.
- Remote reads use `createAsyncThunk` (example: `fetchGetStartedClicks` in `uiSlice.js`).
- Remote writes/persistence occur in `persistenceMiddleware.js` after actions mutate state (example: persisting on `getStartedClicked` and `resetGetStarted`).
- Disable serializable check already configured (Firestore snapshots may include non-serializable data).
- **Live updates (grade A+)**: Use `onSnapshot` subscriptions in `firestoreModel.js` to dispatch actions when remote data changes. Users running multiple app instances see the same data in real-time.

## 4. Firestore Usage Pattern (Grade A Requirements)

- All Firestore document logic lives in `firestoreModel.js` (e.g., `getGetStartedClicks`, `setGetStartedClicks`, `subscribeGetStartedClicks`).
- **Authentication required**: All persisted data must be separated per authenticated user. Use Firebase Auth (`src/firebaseConfig.js`) to get user ID.
- User-specific data: `users/{userId}/metrics/clicks` collection (currently implemented). Pattern: `users/{userId}/...` for other user data.
- **Live updates**: `subscribe*` functions implemented using `onSnapshot` for real-time sync (e.g., `subscribeGetStartedClicks`). Ready to connect to Redux via container components.
- **Current Firestore functions**:
  - `getGetStartedClicks(userId)` - Read clicks count
  - `setGetStartedClicks(userId, count)` - Write clicks count
  - `subscribeGetStartedClicks(userId, callback)` - Real-time updates
  - `saveUserData(userId, data)` - Generic user data save
  - `getUserData(userId)` - Generic user data read
  - `subscribeToUserData(userId, callback)` - Generic user data subscription
- **Multi-source APIs (grade A+)**: When mashing up data from multiple external APIs, centralize each API client in separate model files (e.g., `externalApiModel.js`).
- **Collaborative features (grade A+)**: For shared state where user actions complement each other, handle conflicts via Firestore transactions or optimistic UI updates with rollback.

## 5. Adding a New Feature Slice (Example Steps)

1. Create `src/app/features/<feature>/<featureSlice>.js` with `createSlice` + optional thunks.
2. Export actions & reducer; register reducer in `rootReducer.js`.
3. For persisted writes: extend `persistenceMiddleware.js` with a conditional on the new action types.
4. For reads on mount: dispatch new thunk from a container (`useEffect` in `AppContainer.jsx` or a feature-specific container). Do not fetch in views.

### Current Feature Slices

- **`authSlice.js`**: Manages user authentication state (`user`, `loading`, `error`, `isAuthChecked`). Includes async thunks for login, register, logout. Auth listener initialized in `AppContainer`.
- **`uiSlice.js`**: Manages UI interactions like Get Started button clicks. Includes async thunk for fetching persisted clicks. Persistence handled via middleware.

## 6. Presenter / View Convention

- Containers (`*Container.jsx`) connect Redux (`connect(...)`) – continue this pattern instead of mixing hooks for consistency.
- Presenters (`AppPresenter.jsx`) handle routing composition, pass only data & callbacks.
- Views (`HomeView.jsx`) remain stateless and only render props.
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

### Get Started Button Flow

User clicks button → `getStartedClicked` reducer increments counter → middleware sees action, persists new count via `setGetStartedClicks` → on page load `fetchGetStartedClicks` thunk retrieves persisted count → state updates → view re-renders.

### Authentication Flow

App mounts → `initAuthListener` called in `AppContainer` → `onAuthStateChanged` listener fires → `setUser` action dispatched → auth state updated → routes re-render based on `user` state → if authenticated, `fetchGetStartedClicks` thunk dispatched with `userId` → user-specific data loaded.

### Login/Registration Flow

User submits form → `LoginView` calls `onLogin`/`onRegister` → `AppContainer` dispatches `loginUser`/`registerUser` thunk → Firebase Auth API called → on success, user object stored in Redux → `onAuthStateChanged` listener fires → routes redirect to home → user-specific data fetched.

## 10. Debugging & Tooling

- Sourcemaps enabled; build `minify: false` to ease Firebase-hosted debugging.
- Fire-and-forget writes: middleware catches errors via `console.warn`; for production, evolve into dispatching an error slice/action.

## 11. Guardrails for AI Changes (Grade A Compliance)

- **Zero concern mixing**: Do NOT introduce Firestore logic directly into components or slices—always route through model + middleware.
- Preserve the Container/Presenter/View layering; new routes belong in `AppPresenter.jsx`.
- Keep middleware side effects idempotent (derive data from current state, not previous assumptions).
- Limit slice state to serializable primitives; computed/derived values should be recalculated in selectors (if added later).
- **Authentication gates**: All persistence operations must check user authentication status first. Currently implemented: middleware checks `state.auth.user?.uid` before persisting; `AppPresenter` uses route guards (`<Navigate>`) to redirect unauthenticated users to `/login`; `AppContainer` only fetches user data when `user?.uid` exists.
- **One role per view**: Each view component should have a single, clear responsibility. Don't mix sidebar + summary in one component.

## 12. Safe Extension Checklist (Grade A Compliance)

Before committing a change:

- Added slice? Registered in `rootReducer.js`.
- Added persistence? Middleware updated, no side effects in reducers/components. User authentication checked.
- Added remote read? Implemented thunk + dispatched from container.
- Added UI element? Pure & receives all data via props. Includes loading/error states.
- Added new view? Single clear role, one module per view, uses Material UI components.
- Added API integration? Centralized in model file, provides clear system status feedback.
- **Grade A extras**: Live updates via `onSnapshot`? Multi-source API mashup? Collaborative features with conflict handling?

---

**Project Goal**: Grade A per DH2642 criteria. Focus on: strict separation of concerns, authentication, responsive design, user consultation documentation, and creative UX beyond state of art.
