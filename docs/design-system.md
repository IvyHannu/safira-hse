# Design system showcases

Worker and Admin UI components live in their respective app directories. They consume the shared `@safira/design-tokens` package; no cross-platform UI components are shared.

- Admin: run `pnpm dev:admin` and open `/design-system`.
- Worker: run `pnpm dev:worker` and open `/design-system` through Expo Router, or use the link on the local demo Profile screen.

Both routes show generic component examples only. The Admin route returns 404 in a production build, and the Worker route redirects to `/` when `__DEV__` is false. To remove the showcases later, delete the two route files and their development links from the app home pages. The reusable components remain separate from the showcase routes.
