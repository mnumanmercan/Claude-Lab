# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# First-time setup (install deps + generate Prisma client + run migrations)
npm run setup

# Development server (Turbopack, requires node-compat shim)
npm run dev

# Build for production
npm run build

# Run all tests
npm test

# Run a single test file
npx vitest run src/lib/__tests__/file-system.test.ts

# Lint
npm run lint

# Reset the SQLite database
npm run db:reset
```

The `NODE_OPTIONS='--require ./node-compat.cjs'` prefix is baked into all dev/build scripts — do not remove it, it patches Node.js compatibility for Next.js 15 + React 19.

Prisma client is generated to `src/generated/prisma` (not the default location). Always run `npx prisma generate` after schema changes.

## Architecture

### High-level flow

1. User submits a prompt in the chat panel.
2. `ChatContext` (`src/lib/contexts/chat-context.tsx`) calls `POST /api/chat` via the Vercel AI SDK `useChat` hook, sending the current message history and the serialized virtual file system.
3. The API route (`src/app/api/chat/route.ts`) streams a response from Claude (`claude-haiku-4-5`) using two tools: `str_replace_editor` and `file_manager`.
4. Tool calls stream back to the client; `FileSystemContext.handleToolCall` applies them to the in-memory `VirtualFileSystem`.
5. A `refreshTrigger` counter increments on every FS mutation, causing `FileTree`, `CodeEditor`, and `PreviewFrame` to re-render.
6. `PreviewFrame` compiles the virtual files with Babel Standalone in the browser and injects the result as `iframe.srcdoc` — there is no server-side build step for the preview.

### Virtual file system

`src/lib/file-system.ts` — `VirtualFileSystem` is a fully in-memory tree structure. It is serialized to a plain `Record<string, FileNode>` for transport (API requests, Prisma storage). `FileSystemContext` wraps it with React state and exposes `handleToolCall` which processes `str_replace_editor` and `file_manager` tool invocations from the AI stream.

### AI tools

- `str_replace_editor` (`src/lib/tools/str-replace.ts`) — create / view / str_replace / insert operations on the virtual FS.
- `file_manager` (`src/lib/tools/file-manager.ts`) — rename and delete operations.

### Provider / mock

`src/lib/provider.ts` — if `ANTHROPIC_API_KEY` is absent or empty, a `MockLanguageModel` is used that generates hardcoded counter/form/card components. The real model is `claude-haiku-4-5`.

### Authentication

Custom JWT auth (`src/lib/auth.ts`) using `jose` + bcrypt. Sessions are stored as HTTP-only cookies (7-day expiry). Server Actions in `src/actions/` handle sign-in, sign-up, sign-out, and project CRUD. Anonymous users can work without an account; their in-progress work is tracked in localStorage via `src/lib/anon-work-tracker.ts`.

### Database

SQLite via Prisma. Two models: `User` (email + hashed password) and `Project` (stores serialized message history as JSON string and file system state as JSON string). Schema at `prisma/schema.prisma` — always reference it when reasoning about data structures.

### Dark theme

Dark mode uses a `.dark` class on `<html>` toggled by the button in `HeaderActions`. The CSS custom variant `@custom-variant dark (&:is(.dark *))` in `globals.css` enables Tailwind `dark:` variants. Preference persists in `localStorage`. Monaco editor switches between `vs-dark` / `vs` via a `MutationObserver` in `CodeEditor`.

### Environment variables

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Required for real AI responses; falls back to mock if absent |
| `JWT_SECRET` | JWT signing key; defaults to `development-secret-key` |
| `DATABASE_URL` | Unused (SQLite path is hardcoded in schema as `file:./dev.db`) |

### Path alias

`@/` maps to `src/`.

## Code style

Use comments sparingly — only for logic that is genuinely non-obvious. Self-explanatory code should not be commented.
