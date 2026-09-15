# git-sushi

Desktop app (Tauri 2 + React + TypeScript) showing GitHub PRs that need the user's attention.

## Stack

- Package manager is **yarn**, not npm.
- Frontend: React + TypeScript, built with Vite.
- Backend: Rust, in `src-tauri/`. Entry point `src-tauri/src/main.rs` calls `git_sushi_lib::run()`.
- GitHub auth uses the OAuth **device flow**, implemented entirely in Rust (`src-tauri/src/github_auth.rs`) to avoid CORS issues and to store the token in the OS keychain via the `keyring` crate rather than browser storage. The frontend only calls the exposed Tauri commands (`github_start_device_flow`, `github_poll_device_flow`, `github_stored_token`, `github_logout`) and never touches the token's storage directly.
- `GITHUB_CLIENT_ID` is read from `src-tauri/.env` (see `.env.example`) via `build.rs`, and baked into the binary with `env!("GITHUB_CLIENT_ID")` in `github_auth.rs` — it's not a runtime env var. Device flow is a public-client flow, so no client secret is ever used.
- Once authenticated, the frontend talks to GitHub directly via the GraphQL API (`api.github.com/graphql`) using the stored token — see `src/lib/github.ts`.

## Code style

- No comments. Code should be self-descriptive through naming; if something needs explaining, extract a well-named function or variable instead.
- Favor declarative React: composition and derived state over imperative step-by-step logic.
- Each server-affecting action gets its own hook that returns its `useQuery`/`useMutation` result directly — never wrap it in a custom object. Consumers use the native `data`/`isPending`/`error`/`mutate` surface instead of names we invented. See `src/hooks/useToken.ts`, `useViewer.ts`, `useSignIn.ts`, `useSignOut.ts`, composed together in `src/App.tsx`. Shared cache keys live in `src/lib/queryKeys.ts`.

## Design system

Colors, radii, shadows, and fonts are ported from `~/dev/portfolio` (the user's personal site, same author) to keep visual continuity — see `src/styles/tokens.css` for the `--pg-*` custom properties. If the portfolio's palette changes, re-sync from `~/dev/portfolio/src/app/globals.css` rather than diverging. Fonts are Caprasimo (headings) + Figtree (body), loaded via Google Fonts in `index.html`.

Dark/light mode is driven by `html[data-mode]`, toggled and persisted via `src/hooks/useTheme.ts` (mirrors the portfolio's approach).
