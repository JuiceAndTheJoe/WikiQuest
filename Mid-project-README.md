# DH2642 Interactive Programming Project

## Project description

WikiQuest is a quiz game that tests your knowledge of famous people using real content from Wikipedia. Each round, you are shown a short, progressively revealing summary of a celebrity's article. Your goal is to guess the name of the person.

Your score depends on how many celebrities you identify correctly in a single run, how many hints you use, and how long you survive before losing all your lives. The game tracks advanced statistics across runs (such as total score and best streak) and features a global leaderboard so you can compare your performance with other players. You can play as a guest (anonymous session) or with an email/password account; both modes auto save/resume in-progress runs. Guests can view the leaderboard but are filtered out from the rankings.

## What we have done

- Implemented the full WikiQuest gameplay loop:
  - Progressive guessing game based on Wikipedia biography text.
  - Hint system that reveals more information at a score penalty.
  - Life system and game-over state with a detailed results screen.
- Set up user authentication using Firebase Authentication (email/password) with optional guest sessions.
- Implemented per-user (and guest) persistence in Firestore:
  - Global leaderboard with aggregated scores per authenticated user (guests are excluded from rankings but can view them).
  - Per-run summaries stored when a game ends.
  - Automatic save/resume of an in-progress game per user or guest session.
- Built a structured front-end architecture with React + Vite:
  - Redux Toolkit for application state, including separate slices for auth, game logic, and Wikipedia data.
  - Custom persistence middleware for all Firestore writes (game progress and leaderboard updates).
  - Clear separation between containers, presenters, and views.
- Designed a responsive UI using Material UI (MUI):
  - Themed typography, buttons, cards, and layouts.
  - Animated background for a more engaging experience. Currently very subtle, will be improved on later.
- Added a global leaderboard view that displays top players based on their scores.
- Added a results view that summarizes each finished run (score, streaks, and basic stats).

## What we still plan to do

- Add live leaderboard updates using Firestore `onSnapshot` so changes appear in real time.
- Refine game balance, for example by adjusting when images and specific types of hints are shown. Currently the images make the game too easy.
- Add a larger pool of celebrities and prevent getting the same celebrity more than once in a single run.
- Improve the visual design further with additional animations and polished graphics.
- Conduct user testing sessions and incorporate structured user feedback into the design and game mechanics.

## Project file structure

High-level structure of the project (only key files and folders are listed):

- `package.json` – Project metadata, scripts (`dev`, `build`, `serve`), and dependencies.
- `vite.config.js` – Vite configuration for the React app.
- `firebase.json` – Firebase Hosting configuration for deployment.

### Source code (`src/`)

- `src/index.jsx` – Entry point that renders the React application into the DOM.
- `src/ReactRoot.jsx` – Wraps the app with React Router, Redux Provider, and the Material UI theme.
- `src/firebaseConfig.js` – Initializes Firebase (Auth and Firestore) and exports configured instances.

#### Application state and models (`src/app/`)

- `src/app/store.js` – Configures the Redux store and applies middleware.
- `src/app/rootReducer.js` – Combines all Redux slices (auth, game, Wikipedia).
- `src/app/api.js` – Shared helpers for making external API requests.

**Models (`src/app/models/`)**

- `src/app/models/constants.js` – Shared Firestore collection/document name constants.
- `src/app/models/leaderboardModel.js` – Reads and writes leaderboard data in Firestore (e.g., `saveGameResult`, `getLeaderboard`).
- `src/app/models/gameProgressModel.js` – Handles saving, loading, and clearing a user's in-progress game at `users/{uid}/sessions/game`.
- `src/app/models/userModel.js` – Generic per-user data operations (read, write, subscribe).
- `src/app/models/wikipediaModel.js` – Fetches summaries from the Wikipedia REST API used for hints and question text.

**Features (`src/app/features/`)**

- `src/app/features/auth/authSlice.js` – Redux slice for authentication state, including login, registration, logout, and status flags.
- `src/app/features/auth/authListeners.js` – Sets up the Firebase `onAuthStateChanged` listener and dispatches auth actions.
- `src/app/features/game/gameSlice.js` – Core game logic and state, including levels, lives, scoring, hints, saved games, and run summaries.
- `src/app/features/game/gameConstants.js` – Constants for game configuration (scores, penalties, maximum lives, etc.).
- `src/app/features/game/gameUtils.js` – Pure helper functions for game logic (picking celebrities, normalizing guesses, building summaries).
- `src/app/features/wikipedia/wikipediaSlice.js` – Redux slice handling Wikipedia page data, loading states, and errors.

**Middleware (`src/app/middleware/`)**

- `src/app/middleware/persistenceMiddleware.js` – Observes Redux actions and persists game progress and results to Firestore (auto-save and leaderboard updates).

#### UI components (`src/components/`)

- `src/components/PrimaryButton.jsx` – Reusable button component styled with the project theme.
- `src/components/background/ColorBends.jsx` – Animated background component that creates a dynamic visual effect.

#### Presenters and containers (`src/presenters/`)

- `src/presenters/AppContainer.jsx` – Connects the root app to Redux and initializes global listeners (such as auth).
- `src/presenters/AppPresenter.jsx` – Defines the main route structure (home, game, login, leaderboard, results) and route guards.
- `src/presenters/HomeContainer.jsx` – Connects home view to Redux (user stats, saved game flag) and triggers loading of saved games.
- `src/presenters/HomePresenter.jsx` – Maps home data and callbacks to `HomeView` (start game, resume game, view leaderboard, logout).
- `src/presenters/GameContainer.jsx` – Connects game state to Redux, manages initial loading of saved game or new game, and fetches Wikipedia content.
- `src/presenters/GamePresenter.jsx` – Prepares data and handlers for `GameView` (guesses, hints, navigation between questions).
- `src/presenters/LeaderboardContainer.jsx` – Fetches leaderboard data from Redux and passes it to the leaderboard view.
- `src/presenters/LeaderboardPresenter.jsx` – Shapes leaderboard data and interactions for `LeaderboardView`.
- `src/presenters/ResultsContainer.jsx` – Connects the last game result stored in Redux to the results view.
- `src/presenters/ResultsPresenter.jsx` – Prepares results data (score, stats) and navigation callbacks for `ResultsView`.
- `src/presenters/LoginPresenter.jsx` – Manages login and registration interactions for the login view.

#### Views (`src/views/`)

- `src/views/HomeView.jsx` – Main menu and dashboard for authenticated users, including stats, start/resume game actions, and leaderboard access.
- `src/views/GameView.jsx` – Core gameplay interface where users read clues, enter guesses, and request hints.
- `src/views/LeaderboardView.jsx` – Displays the global leaderboard with top players and their scores.
- `src/views/LoginView.jsx` – Login and registration screen with email/password form and validation.
- `src/views/ResultsView.jsx` – Game-over summary showing final score, streaks, and navigation back to the main menu or leaderboard.

#### Styling (`src/styles/`)

- `src/styles/theme.js` – Material UI theme configuration (colors, typography, component overrides).
