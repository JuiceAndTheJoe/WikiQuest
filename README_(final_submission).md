# DH2642 Interactive Programming Project

React + Vite application with Redux Toolkit state management and Firebase backend.

## Setup

### Prerequisites

- Node.js (v16+)
- Firebase CLI (for deployment): `npm install -g firebase-tools`

### Installation

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:8080)
npm run dev
```

### Available Scripts

- `npm run dev` - Start Vite development server with HMR
- `npm run build` - Create production build in `dist/`
- `npm run serve` - Preview production build locally
- `firebase deploy` - Deploy to Firebase Hosting
- `npm run lint` - Run ESLint on the project
- `npm run format` - Format source files with Prettier

## Tech Stack

- **Framework**: React 18 with Vite
- **State Management**: Redux Toolkit with custom persistence middleware
- **UI Library**: Material UI (MUI) v7
- **Routing**: React Router v6
- **Backend**: Firebase (Auth + Firestore)
- **Styling**: Emotion (MUI's CSS-in-JS solution)
- **External APIs**: Wikipedia REST API (summary endpoint)

## Architecture

Clean separation of concerns following Model-View-Presenter pattern:

- **Persistence Layer**: Firestore access lives in `src/app/models/` (`firestoreModel.js`, `leaderboardModel.js`, `gameProgressModel.js`, `userModel.js`). Game progress is stored per user (or guest) under `users/{uid}/sessions/game` with a `savedAt` timestamp.
- **External APIs**: `src/app/models/wikipediaModel.js` for Wikipedia REST API integration.
- **Application State**: Redux slices in `src/app/features/`.
- **Middleware**: `src/app/middleware/persistenceMiddleware.js` (syncs game state and results to Firestore; clears saved sessions on game over).
- **Containers**: `*Container.jsx` (Redux-connected, side effects).
- **Presenters**: App-level `AppPresenter.jsx` (routing only) and per-view presenters (`HomePresenter.jsx`, `LoginPresenter.jsx`, `GamePresenter.jsx`, etc.) for prop composition and local UI state.
- **Views**: Pure presentational components in `src/views/` (no logic/state besides rendering props).

## Third-Party Components (User-Visible)

The project uses **Material UI** components throughout for grade A compliance. Locations:

### Material UI Components

Material UI is used across all major views for buttons, cards, typography, inputs, and layout primitives (e.g., `Avatar`, `Card`, `Stack`, `Typography`, `Button`, `TextField`, `Alert`). The theme is provided in `ReactRoot.jsx` via `ThemeProvider` and configured in `styles/theme.js`.

### React Router Components

- **`src/ReactRoot.jsx`**: `BrowserRouter`
- **`src/presenters/AppPresenter.jsx`**: `Routes`, `Route`, `Navigate`

## Firebase Configuration

Firebase is pre-configured in `src/firebaseConfig.js`. The app connects to:

- **Project ID**: `iprog-project-c443f`
- **Services**: Authentication (Email/Password), Firestore Database
- **Authentication Flow**: Managed via `authSlice.js` with `onAuthStateChanged` listener. Users can log in with email/password or start a guest session; guest sessions do not auto-start and must be chosen explicitly.
- **User Data**: Stored per-user in Firestore at `users/{userId}` (aggregate stats, leaderboard info). Guest sessions persist progress but are filtered out of leaderboard rankings.

## Project Structure

```text
src/
├── app/
│   ├── store.js                    # Redux store configuration
│   ├── rootReducer.js              # Combine feature reducers
│   ├── models/
│   │   ├── firestoreModel.js       # Shared Firestore helpers
│   │   ├── leaderboardModel.js     # Leaderboard reads/writes
│   │   ├── gameProgressModel.js    # Save/resume session storage
│   │   ├── userModel.js            # Generic user data helpers
│   │   └── wikipediaModel.js       # Wikipedia REST API client
│   ├── features/
│   │   ├── auth/
│   │   │   └── authSlice.js        # Authentication state & thunks
│   │   ├── game/
│   │   │   └── gameSlice.js        # Game logic, levels, leaderboard & saved games
│   │   └── wikipedia/
│   │       └── wikipediaSlice.js   # Wikipedia summary state & thunk
│   └── middleware/
│       └── persistenceMiddleware.js # Auto-persist state to Firebase
├── components/
│   └── PrimaryButton.jsx           # Reusable UI components
├── presenters/
│   ├── AppContainer.jsx            # Redux-connected container
│   ├── AppPresenter.jsx            # Routing logic
│   ├── GameContainer.jsx           # Game state + Wikipedia sync + saved game boot
│   ├── HomePresenter.jsx           # Presenter for HomeView (UI state + prop composition)
│   ├── LeaderboardContainer.jsx    # Fetch & present leaderboard
│   ├── ResultsContainer.jsx        # Present last game summary
│   └── LoginPresenter.jsx          # Presenter for LoginView (form state + handlers)
├── views/
│   ├── GameView.jsx                # Active quiz interface
│   ├── HomeView.jsx                # Authenticated home view
│   ├── LeaderboardView.jsx         # Global leaderboard UI
│   ├── LoginView.jsx               # Login/registration view
│   └── ResultsView.jsx             # Game over summary
├── styles/
│   └── theme.js                    # Material UI theme
├── firebaseConfig.js               # Firebase initialization
├── ReactRoot.jsx                   # App root with providers
└── index.jsx                       # Entry point
```

## Save & Resume Gameplay

- **Auto-save triggers**: The Redux persistence middleware writes the current game state to Firestore after starting a game, using a hint, and after each guess. Data is stored per user (including guests) at `users/{uid}/sessions/game` with a `savedAt` timestamp.
- **Resume flow**: On login or guest start, `HomeContainer` dispatches `loadSavedGame(userId)` to detect prior sessions. `GameContainer` also attempts to load on mount; if none exists it starts a fresh run.
- **UI**: `HomeView` shows a **Resume Game** button when a saved session exists (`hasSavedGame` flag). Starting a new game resets `hasSavedGame` and overwrites the saved snapshot.
- **Game over**: When a run ends, middleware clears the saved session and persists the final summary to the leaderboard via `saveGameResult` (guests are persisted but excluded from ranking display).

This ensures players can leave mid-run and continue later without losing progress, while completed runs are recorded in the leaderboard.

## Development Notes

- Port `8080` is used for local development (configured in `vite.config.js`)
- Sourcemaps enabled for debugging (`minify: false` in build)
- Firebase serializable check disabled in Redux (Firestore snapshots)
- All state changes that need persistence go through Redux middleware
- No direct Firebase calls in components or slices
- External API calls centralized in model files (`mediaWikiModel.js`)
- Wikipedia API integration relies solely on the summary endpoint for lightweight hints

## Grade A Target

This project follows DH2642 grade A requirements:

- ✅ State manager (Redux Toolkit) with middleware
- ✅ Zero concern mixing (strict layer separation)
- ✅ Framework-independent Redux (`connect()` instead of hooks)
- ✅ User-visible third-party components (Material UI in all views)
- ✅ Authentication-gated persistence (Firebase Auth with email/password)
- ✅ Auth state listener (`onAuthStateChanged` in `authSlice.js`)
- ✅ Protected routes (redirect to `/login` if not authenticated)
- ✅ User-specific data storage (`users/{userId}` documents with stats/leaderboard fields)
- ✅ Loading states and error handling (auth errors, UI loading states)
- ✅ Form validation (email/password requirements in LoginView)
- ✅ External API integration (Wikipedia REST API summary data surfaced in `GamePresenter`)
- 🔄 Live updates via `onSnapshot` (subscribe functions ready, not yet connected)
- 🔄 User consultation documentation (to be added)

See `.github/copilot-instructions.md` for detailed architectural guidelines.
