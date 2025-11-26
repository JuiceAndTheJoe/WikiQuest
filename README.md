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

## Tech Stack

- **Framework**: React 18 with Vite
- **State Management**: Redux Toolkit with custom persistence middleware
- **UI Library**: Material UI (MUI) v7
- **Routing**: React Router v6
- **Backend**: Firebase (Auth + Firestore)
- **Styling**: Emotion (MUI's CSS-in-JS solution)

## Architecture

Clean separation of concerns following Model-View-Presenter pattern:

- **Persistence Layer**: `src/app/firestoreModel.js` (Firebase operations)
- **Application State**: Redux slices in `src/app/features/`
- **Middleware**: `src/app/middleware/persistenceMiddleware.js` (sync state to Firebase)
- **Containers**: `*Container.jsx` (Redux-connected, side effects)
- **Presenters**: `*Presenter.jsx` (routing, prop composition)
- **Views**: Pure presentational components in `src/views/`

## Third-Party Components (User-Visible)

The project uses **Material UI** components throughout for grade A compliance. Locations:

### Material UI Components

- **`src/ReactRoot.jsx`**: `ThemeProvider`, `CssBaseline`
- **`src/views/HomeView.jsx`**: `Paper`, `Stack`, `Typography`, `Button`, `CircularProgress`, `Box`, `Divider`
- **`src/views/LoginView.jsx`**: `Paper`, `Stack`, `Typography`, `TextField`, `Alert`, `Button`
- **`src/components/PrimaryButton.jsx`**: `Button` (wrapped in custom component)
- **`src/presenters/AppPresenter.jsx`**: `CircularProgress`, `Box` (auth loading state)
- **`src/styles/theme.js`**: `createTheme` (theme configuration)

### React Router Components

- **`src/ReactRoot.jsx`**: `BrowserRouter`
- **`src/presenters/AppPresenter.jsx`**: `Routes`, `Route`, `Navigate`

## Firebase Configuration

Firebase is pre-configured in `src/firebaseConfig.js`. The app connects to:

- **Project ID**: `iprog-project-c443f`
- **Services**: Authentication (Email/Password), Firestore Database
- **Authentication Flow**: Managed via `authSlice.js` with `onAuthStateChanged` listener
- **User Data**: Stored per-user in Firestore at `users/{userId}/metrics/clicks`

## Project Structure

```text
src/
├── app/
│   ├── store.js                    # Redux store configuration
│   ├── rootReducer.js              # Combine feature reducers
│   ├── firestoreModel.js           # Centralized Firebase operations
│   ├── features/
│   │   ├── auth/
│   │   │   └── authSlice.js        # Authentication state & thunks
│   │   └── ui/
│   │       └── uiSlice.js          # UI state slice
│   └── middleware/
│       └── persistenceMiddleware.js # Auto-persist state to Firebase
├── components/
│   └── PrimaryButton.jsx           # Reusable UI components
├── presenters/
│   ├── AppContainer.jsx            # Redux-connected container
│   └── AppPresenter.jsx            # Routing logic
├── views/
│   ├── HomeView.jsx                # Authenticated home view
│   └── LoginView.jsx               # Login/registration view
├── styles/
│   └── theme.js                    # Material UI theme
├── firebaseConfig.js               # Firebase initialization
├── ReactRoot.jsx                   # App root with providers
└── index.jsx                       # Entry point
```

## Development Notes

- Port `8080` is used for local development (configured in `vite.config.js`)
- Sourcemaps enabled for debugging (`minify: false` in build)
- Firebase serializable check disabled in Redux (Firestore snapshots)
- All state changes that need persistence go through Redux middleware
- No direct Firebase calls in components or slices

## Grade A Target

This project follows DH2642 grade A requirements:

- ✅ State manager (Redux Toolkit) with middleware
- ✅ Zero concern mixing (strict layer separation)
- ✅ Framework-independent Redux (`connect()` instead of hooks)
- ✅ User-visible third-party components (Material UI in all views)
- ✅ Authentication-gated persistence (Firebase Auth with email/password)
- ✅ Auth state listener (`onAuthStateChanged` in `authSlice.js`)
- ✅ Protected routes (redirect to `/login` if not authenticated)
- ✅ User-specific data storage (`users/{userId}/metrics/clicks`)
- ✅ Loading states and error handling (auth errors, UI loading states)
- ✅ Form validation (email/password requirements in LoginView)
- 🔄 Live updates via `onSnapshot` (subscribe functions ready, not yet connected)
- 🔄 Multi-source API integration (to be implemented)
- 🔄 User consultation documentation (to be added)

See `.github/copilot-instructions.md` for detailed architectural guidelines.
