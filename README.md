# My Zerra

A modern full-stack React application built with [TanStack Start](https://tanstack.com/start), featuring a feature-based architecture, Tailwind CSS v4, shadcn/ui components, and a custom nature-inspired design system.

## Tech Stack

| Layer            | Technology                                                                      |
| ---------------- | ------------------------------------------------------------------------------- |
| Framework        | [TanStack Start](https://tanstack.com/start) (Full-stack React with SSR)        |
| Router           | [TanStack Router](https://tanstack.com/router) (File-based routing)             |
| Styling          | [Tailwind CSS v4](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)   |
| UI Components    | [shadcn/ui](https://ui.shadcn.com/) (New York style)                            |
| Data Fetching    | [TanStack Query](https://tanstack.com/query)                                    |
| Forms            | [TanStack Form](https://tanstack.com/form)                                      |
| Tables           | [TanStack Table](https://tanstack.com/table)                                    |
| State Management | [Zustand](https://github.com/pmndrs/zustand)                                    |
| Validation       | [Zod](https://zod.dev/)                                                         |
| Build Tool       | [Vite](https://vitejs.dev/)                                                     |
| Testing          | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) |
| Package Manager  | [Bun](https://bun.sh/)                                                          |

## Prerequisites

- [Bun](https://bun.sh/) (latest version)
- Node.js 20+ (for compatibility)

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Start the development server

```bash
bun --bun run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### 3. Build for production

```bash
bun --bun run build
```

### 4. Preview production build

```bash
bun --bun run preview
```

## Available Scripts

| Script                  | Description                           |
| ----------------------- | ------------------------------------- |
| `bun --bun run dev`     | Start development server on port 3000 |
| `bun --bun run build`   | Build for production                  |
| `bun --bun run preview` | Preview production build              |
| `bun --bun run test`    | Run tests with Vitest                 |
| `bun --bun run lint`    | Run ESLint                            |
| `bun --bun run format`  | Check Prettier formatting             |
| `bun --bun run check`   | Auto-fix Prettier and ESLint issues   |

## Project Structure

This project uses **feature-based folder organization**. Code is grouped by business domain/feature, not by technical layer.

```
src/
├── features/                 # Business domain features
│   └── demo/                 # Example feature (safe to delete)
│       ├── components/       # Feature-specific components
│       ├── hooks/            # Feature-specific hooks
│       ├── api/              # Feature API calls and data
│       ├── types.ts          # Feature domain types
│       └── index.ts          # Public barrel exports
├── shared/                   # Cross-cutting concerns
│   ├── components/           # Shared UI components
│   │   ├── ui/               # shadcn/ui primitives
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ThemeToggle.tsx
│   ├── hooks/                # Cross-feature hooks
│   └── lib/                  # Utilities (cn, formatters, etc.)
├── routes/                   # TanStack Router route files
│   ├── __root.tsx            # Root layout
│   ├── index.tsx             # Home page
│   ├── about.tsx
│   └── demo/                 # Demo routes (safe to delete)
├── integrations/             # Third-party integrations
│   └── tanstack-query/       # QueryClient setup
├── router.tsx                # Router configuration
└── styles.css                # Global styles + Tailwind theme
```

### Path Aliases

| Alias | Target    | Usage                                 |
| ----- | --------- | ------------------------------------- |
| `#/*` | `./src/*` | Primary import alias for project code |
| `@/*` | `./src/*` | Secondary alias (same as `#/*`)       |

**Always import from feature barrels, not internal paths:**

```tsx
// Good
import { useAppForm } from '#/features/demo'

// Bad - avoid deep imports
import { useAppForm } from '#/features/demo/hooks/useDemoForm'
```

## Feature-Based Architecture

### Creating a New Feature

Create a folder under `src/features/` with this structure:

```
src/features/your-feature/
├── components/          # Feature-specific React components
├── hooks/               # Feature-specific hooks
├── api/                 # API calls, server functions, data fetching
├── types.ts             # Domain types for this feature
└── index.ts             # Barrel exports
```

**Rules:**

- Features are **self-contained** — all related code lives in one place
- Export everything through `index.ts` (barrel file)
- Only truly reusable primitives go in `shared/`
- Never import from another feature's internal paths

### When to Create a Feature

- The domain has multiple related components/hooks
- It has its own data types and API interactions
- It could potentially be extracted as a standalone module

### When to Use `shared/`

- Generic UI primitives (buttons, inputs, dialogs)
- Utility functions used across features
- Hooks that don't belong to a specific domain

## Routing

This project uses [TanStack Router](https://tanstack.com/router) with **file-based routing**. Route files are managed in `src/routes/`.

### Adding a Route

Create a new file in `src/routes/`. The file path determines the URL:

| File Path                         | Route URL               |
| --------------------------------- | ----------------------- |
| `src/routes/index.tsx`            | `/`                     |
| `src/routes/about.tsx`            | `/about`                |
| `src/routes/blog/$postId.tsx`     | `/blog/:postId`         |
| `src/routes/dashboard/layout.tsx` | `/dashboard/*` (layout) |

Example route file:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return <div>About</div>
}
```

### Navigation

Use the `Link` component for SPA navigation:

```tsx
import { Link } from '@tanstack/react-router'
;<Link to="/about">About</Link>
```

### Layouts

The root layout is defined in `src/routes/__root.tsx`. Anything added there appears on all routes. Use `shellComponent` to wrap all pages:

```tsx
export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'My App' },
    ],
  }),
  shellComponent: RootDocument,
})
```

### Data Loading

Use route loaders to fetch data before rendering:

```tsx
export const Route = createFileRoute('/people')({
  loader: async () => {
    const response = await fetch('https://api.example.com/people')
    return response.json()
  },
  component: PeopleComponent,
})

function PeopleComponent() {
  const data = Route.useLoaderData()
  return (
    <ul>
      {data.map((person) => (
        <li key={person.id}>{person.name}</li>
      ))}
    </ul>
  )
}
```

## Styling

### Tailwind CSS v4

This project uses Tailwind CSS v4 with the CSS-based configuration in `src/styles.css`:

```css
@import 'tailwindcss';
@plugin '@tailwindcss/typography';
@plugin 'daisyui';

@theme inline {
  --font-sans: 'Manrope', ui-sans-serif, system-ui, sans-serif;
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... */
}
```

### Custom Design Tokens

The project includes a custom nature-inspired color palette:

| Token       | Light     | Dark      |
| ----------- | --------- | --------- |
| `--sea-ink` | `#173a40` | `#d7ece8` |
| `--lagoon`  | `#4fb8b2` | `#60d7cf` |
| `--palm`    | `#2f6a4a` | `#6ec89a` |
| `--sand`    | `#e7f0e8` | `#0f1a1e` |
| `--foam`    | `#f3faf5` | `#101d22` |

### Dark Mode

Dark mode is supported via a `.dark` class on the `<html>` element. The theme is managed through localStorage and applied via an inline script in `__root.tsx` to prevent hydration flicker.

### shadcn/ui Components

UI primitives are managed with shadcn/ui and stored in `src/shared/components/ui/`.

**Adding a new component:**

```bash
pnpm dlx shadcn@latest add button
```

Components use the **New York** style with **lucide-react** icons.

## State Management

### Server State: TanStack Query

Server state is managed with [TanStack Query](https://tanstack.com/query). The `QueryClient` is initialized in `src/integrations/tanstack-query/root-provider.tsx` and provided via router context.

Example usage:

```tsx
import { useQuery } from '@tanstack/react-query'

function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}`)
      return res.json()
    },
  })

  if (isLoading) return <div>Loading...</div>
  return <div>{data.name}</div>
}
```

### Client State: Zustand

For client-only state, use [Zustand](https://github.com/pmndrs/zustand):

```tsx
import { create } from 'zustand'

interface BearState {
  bears: number
  increase: () => void
}

const useBearStore = create<BearState>((set) => ({
  bears: 0,
  increase: () => set((state) => ({ bears: state.bears + 1 })),
}))
```

## Forms

Forms are built with [TanStack Form](https://tanstack.com/form) and validated with [Zod](https://zod.dev/):

```tsx
import { useAppForm } from '#/features/demo'

function MyForm() {
  const form = useAppForm({
    defaultValues: {
      name: '',
      email: '',
    },
    validators: {
      onChange: z.object({
        name: z.string().min(1),
        email: z.string().email(),
      }),
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.AppField name="name">
        {(field) => <field.TextField label="Name" />}
      </form.AppField>
      <form.AppField name="email">
        {(field) => <field.TextField label="Email" />}
      </form.AppField>
      <form.SubscribeButton label="Submit" />
    </form>
  )
}
```

## Server Functions

TanStack Start provides server functions for writing server-side code that integrates seamlessly with client components:

```tsx
import { createServerFn } from '@tanstack/react-start'

const getServerTime = createServerFn({
  method: 'GET',
}).handler(async () => {
  return new Date().toISOString()
})

// Use in a component
const time = await getServerTime()
```

## API Routes

Create API routes using the `server` property in route definitions:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: () => json({ message: 'Hello, World!' }),
    },
  },
})
```

## Code Style & Conventions

### General Principles

- Use **strict typing** everywhere — function returns, variables, collections
- Prefer **functional programming** over OOP
- Write **pure functions** — only modify return values, never input parameters or global state
- Follow **DRY**, **KISS**, and **YAGNI** principles
- Use comments sparingly — only for complex logic
- Comments in **English only**

### TypeScript Rules

- `noUnusedLocals: true` — unused variables will error
- `noUnusedParameters: true` — unused parameters will error
- `strict: true` — all strict type checking enabled
- Never use default parameter values — make all parameters explicit
- Avoid generic types like `Any`, `unknown`, or loose dictionaries

### Error Handling

- Always raise errors explicitly, never silently ignore them
- Use specific error types that clearly indicate what went wrong
- Error messages must include enough context to debug
- No fallbacks unless explicitly requested
- Fix root causes, not symptoms

### Imports

- All imports at the top of the file
- Use path aliases for internal imports
- Import from feature barrels, not internal paths

### Formatting (Prettier)

- `semi: false`
- `singleQuote: true`
- `trailingComma: 'all'`

Run `bun --bun run check` to auto-fix formatting and linting issues.

## Git Workflow

### Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by [commitlint](https://commitlint.js.org/):

```
feat: add user authentication
fix: resolve login redirect issue
docs: update API documentation
style: fix formatting in Header component
refactor: simplify data fetching logic
test: add unit tests for auth hook
chore: update dependencies
```

### Pre-commit Hooks

[Husky](https://typicode.github.io/husky/) runs checks before commits. The pre-commit hook ensures code quality standards are met.

## Testing

Tests are written with [Vitest](https://vitest.dev/) and [Testing Library](https://testing-library.com/):

```bash
# Run tests once
bun --bun run test

# Run tests in watch mode
bun --bun run test --watch
```

Example test:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Header } from '#/shared/components'

describe('Header', () => {
  it('renders the app title', () => {
    render(<Header />)
    expect(screen.getByText('My Zerra')).toBeInTheDocument()
  })
})
```

## Removing Demo Content

Files prefixed with `demo` or inside `src/features/demo/` and `src/routes/demo/` can be safely deleted. They exist to showcase the installed features.

To clean up:

1. Delete `src/features/demo/`
2. Delete `src/routes/demo/`
3. Remove demo imports from `src/routes/index.tsx` if any
4. Run `bun --bun run check` to clean up any remaining references

## Environment Variables

Create a `.env` file in the project root for local environment variables:

```bash
# Example
VITE_API_URL=http://localhost:4000
```

Variables prefixed with `VITE_` are exposed to the client. Server-only variables should not use the `VITE_` prefix.

## Troubleshooting

### Common Issues

**Build fails with Tailwind CSS errors**

- Ensure you're using Bun: `bun --bun run build`
- Check that `tailwindcss` and `@tailwindcss/vite` versions are compatible

**Route not found**

- Ensure the route file is in `src/routes/`
- Restart the dev server after adding new route files
- Run `bun --bun run check` to regenerate route types

**Import alias not working**

- Check `tsconfig.json` paths configuration
- Restart the TypeScript language server in your editor

**Hydration mismatch**

- Ensure server and client render the same content
- Use `suppressHydrationWarning` for intentionally different content (e.g., theme)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes following the code style conventions
4. Ensure tests pass: `bun --bun run test`
5. Ensure linting passes: `bun --bun run lint`
6. Commit using conventional commits format
7. Push to your fork and open a Pull Request

## Resources

- [TanStack Start Documentation](https://tanstack.com/start)
- [TanStack Router Documentation](https://tanstack.com/router)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query)
- [TanStack Form Documentation](https://tanstack.com/form)

## License

This project is private and not licensed for public use.
