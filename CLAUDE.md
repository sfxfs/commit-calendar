# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

commit-calendar is a React + TypeScript web application that allows users to view their GitHub contribution history and generate custom contribution patterns by automatically creating commits.

## Commands

```bash
npm run dev      # Start development server on http://localhost:5173
npm run build    # Build for production (TypeScript check + Vite build)
npm run preview  # Preview production build
```

## Architecture

### Tech Stack
- React 19 + TypeScript
- Vite 7
- React Router 7 (HashRouter for GitHub Pages compatibility)
- date-fns for date manipulation
- Axios for HTTP requests

### Deployment
- Uses GitHub Actions (`peaceiris/actions-gh-pages`) for automatic deployment
- Deploys to `gh-pages` branch
- Base path: relative (`./`)

### Authentication Flow
- Uses GitHub OAuth with PKCE (Proof Key for Code Exchange)
- Token stored in localStorage
- Auth context provides `useAuth()` hook throughout the app
- OAuth callback handled at `/#/callback` route (HashRouter)

### API Integration
- **GraphQL API** (`https://api.github.com/graphql`): Fetches user contribution calendar
- **REST API** (`https://api.github.com`): Fetches repositories, creates commits
- GitHub Git API (not GraphQL): Creates commits via git blobs, trees, and commits endpoints

### Routing
- Uses `HashRouter` for GitHub Pages compatibility
- Routes: `/login`, `/#/`, `/#/generate`, `/#/callback`

### Key Source Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Routes with HashRouter, protected routes |
| `src/auth/AuthContext.tsx` | OAuth state, PKCE code generation, login/logout |
| `src/api/github.ts` | All GitHub API calls (contributions, repos, commits) |
| `src/components/PatternDesigner.tsx` | Pattern selection (presets + custom grid), commit generation |

### Preset Patterns
Defined in `PatternDesigner.tsx`: `heart`, `1`, `0`, `smiley`, `star` - each is an 8x8 binary matrix

### Environment Variables
- `VITE_GITHUB_CLIENT_ID`: GitHub OAuth App Client ID (set in GitHub Actions secrets)
- Vite base path: `./` (relative, works with any subdirectory)
