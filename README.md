# Insidr Telemetry

[cloudflarebutton]

A modern full-stack application built on Cloudflare Workers, featuring a React frontend with shadcn/ui, Tailwind CSS, and a Hono-powered API backend with Durable Objects for persistent state management.

## Features

- **Full-Stack TypeScript**: End-to-end type safety with shared types between frontend and backend.
- **Cloudflare Workers Backend**: Fast, edge-deployed API using Hono with CORS, logging, and error handling.
- **Durable Objects**: Built-in stateful storage for counters, lists, and custom data persistence.
- **React 18 + Vite**: High-performance frontend bundling with hot module replacement.
- **shadcn/ui**: Beautiful, customizable UI components with Tailwind CSS and Radix UI primitives.
- **Dark Mode**: Automatic theme detection with manual toggle and persistence.
- **Data Fetching**: TanStack Query integration for efficient API calls and caching.
- **Error Handling**: Global error boundaries, client error reporting to the backend.
- **Responsive Design**: Mobile-first layout with sidebar support and animations.
- **Production-Ready**: Optimized builds, TypeScript strict mode, ESLint, and Cloudflare deployment.

## Tech Stack

| Category | Technologies |
|----------|--------------|
| **Backend** | Cloudflare Workers, Hono, Durable Objects |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| **State & Data** | TanStack Query, Zustand, Immer, Durable Objects |
| **UI & UX** | Radix UI, Lucide Icons, Framer Motion, Sonner (Toasts) |
| **Dev Tools** | Bun, Wrangler, ESLint, Tailwind CSS Animate |
| **Other** | React Router, React Hook Form, Zod, Recharts |

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) installed (≥1.0)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (install via `bun add -g wrangler`)
- Cloudflare account with Workers enabled

### Installation

1. Clone the repository:
   ```
   git clone <your-repo-url>
   cd insidr-telemetry-mcpq31xan1arg0nlsmawv
   ```

2. Install dependencies:
   ```
   bun install
   ```

3. Generate Worker types:
   ```
   bun run cf-typegen
   ```

### Development

- Start the development server (frontend + Workers preview):
  ```
  bun run dev
  ```
  Access at `http://localhost:3000` (or `$PORT`).

- In another terminal, for API testing:
  ```
  wrangler dev
  ```

### Build

Build the production frontend bundle:
```
bun run build
```

### Deploy

Deploy to Cloudflare Workers (builds frontend automatically):

```
bun run deploy
```

[cloudflarebutton]

**Note**: Ensure `wrangler.jsonc` has your Cloudflare account ID if deploying to a specific account. Run `wrangler whoami` to verify login.

## Usage

### Backend API (Hono Routes)

Extend routes in `worker/userRoutes.ts`. Example endpoints:

- `GET /api/health` - Health check
- `GET/POST /api/counter` - Durable Object counter
- `GET/POST/PUT/DELETE /api/demo` - CRUD demo items

All responses follow `{ success: boolean, data?: T, error?: string }`.

### Frontend

- Pages in `src/pages/`
- Components in `src/components/` (use shadcn/ui via `npx shadcn-ui@latest add <component>`)
- Hooks in `src/hooks/`
- Shared types in `shared/`

Data fetching example with TanStack Query:
```tsx
const { data } = useQuery({
  queryKey: ['demo'],
  queryFn: () => fetch('/api/demo').then(res => res.json()),
});
```

### Customizing

- **Theme/UI**: Edit `tailwind.config.js` and `src/index.css`.
- **Sidebar**: Modify `src/components/app-sidebar.tsx` or use `AppLayout`.
- **Demo Data**: Update `shared/mock-data.ts` and Durable Object methods.
- **Routes**: Add to `src/main.tsx` router and `worker/userRoutes.ts`.

## Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start dev server |
| `bun run build` | Build production bundle |
| `bun run lint` | Run ESLint |
| `bun run preview` | Preview production build |
| `bun run deploy` | Build + deploy to Cloudflare |
| `bun run cf-typegen` | Generate Worker types |

## Project Structure

```
├── src/              # React frontend
├── worker/           # Cloudflare Workers backend
├── shared/           # Shared types & mocks
├── tailwind.config.js # Design system
└── wrangler.jsonc    # Workers config
```

## Contributing

1. Fork and clone the repo.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit changes: `git commit -m 'Add feature'`.
4. Push and open a PR.

## License

MIT License - see [LICENSE](LICENSE) for details.