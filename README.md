# git-sushi

A desktop app that shows GitHub pull requests that need your attention — e.g. PRs where you've been requested as a reviewer.

Built with [Tauri](https://tauri.app/) (Rust) + React + TypeScript.

## Development

Copy `src-tauri/.env.example` to `src-tauri/.env` and fill in a GitHub OAuth App Client ID (create one at [github.com/settings/developers](https://github.com/settings/developers), with **Enable Device Flow** checked).

```sh
yarn install
yarn tauri dev
```

## License

[MIT](./LICENSE)
