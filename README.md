# ShelfZone Web

Frontend application for the ShelfZone HR + Agent Management Platform.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 4
- **Components:** shadcn/ui (to be added)
- **State:** Zustand + TanStack Query
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts + D3.js (to be added)

## Prerequisites

- Node.js 22+
- Git

## Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/shiwangi-upadhyay/shelfzone-web.git
   cd shelfzone-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment file:
   ```bash
   cp .env.example .env
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000

## Project Structure

```
src/
├── app/              — Next.js App Router pages and layouts
│   ├── (auth)/       — Auth pages (login, register)
│   ├── (hr)/         — HR Portal pages
│   └── (agents)/     — Agent Portal pages
├── components/       — Reusable UI components
├── hooks/            — Custom React hooks
├── lib/              — Utilities, API client, helpers
├── stores/           — Zustand state stores
└── types/            — Shared TypeScript types
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | Lint code |

## Git Workflow

- `main` — Production (protected)
- `testing` — QA branch
- `develop` — Integration branch
- `feature/*` — Feature branches

All merges require explicit approval.

## License

Proprietary — Confidential
