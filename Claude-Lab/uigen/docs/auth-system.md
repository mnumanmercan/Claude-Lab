# How Authentication Works

This app uses a custom auth system built from scratch — no third-party library like NextAuth. Here's how it works from top to bottom.

---

## The big picture

```
User fills in the form
  → useAuth hook calls a Server Action
    → Server Action checks credentials and sets a cookie
      → User gets redirected to their project
```

---

## 1. The dialog — `AuthDialog.tsx`

This is just the modal (popup) you see when clicking Sign In or Sign Up. It holds a `mode` state that switches between `"signin"` and `"signup"`, and renders the matching form. When the form succeeds, it closes itself.

Nothing complicated here — it's purely UI.

---

## 2. The hook — `useAuth.ts`

This is the client-side logic that runs after the server says "yes, credentials are correct".

```
signIn() or signUp()
  → calls the server action
  → if successful:
      → did the user do work before logging in?
          YES → save that work as a project, redirect to it
          NO  → go to their most recent project (or create one)
```

**Anonymous work** is the key concept here. Users can use the app without an account. If they do, their chat messages and generated files are saved in `localStorage`. When they sign in, `useAuth` picks up that work and saves it as a real project so nothing is lost.

---

## 3. The server — `auth.ts`

This file handles the actual security. It uses **JWT (JSON Web Tokens)** to prove who the user is on every request.

### What is a JWT?

A JWT is a small, signed string that contains data — in this case `{ userId, email, expiresAt }`. Because it's signed with a secret key (`JWT_SECRET`), the server can verify it hasn't been tampered with.

### How a session is created

When the user signs in with correct credentials:
1. A JWT is created and signed with `JWT_SECRET`
2. It's stored as an **HTTP-only cookie** named `auth-token`
3. HTTP-only means JavaScript in the browser cannot read it — only the server can, which protects against XSS attacks

The cookie expires after **7 days**.

### How the server reads the session

On any server-side code (Server Components, API routes, Server Actions), `getSession()` is called:
1. It reads the `auth-token` cookie
2. Verifies the JWT signature
3. Returns `{ userId, email, expiresAt }` — or `null` if the token is missing or invalid

### Passwords

Passwords are **never stored as plain text**. They are hashed with `bcrypt` before being saved to the database. When signing in, `bcrypt.compare()` checks the plain text password against the stored hash.

---

## Where each function is used

| Function | Where | What it does |
|---|---|---|
| `createSession()` | Server Actions (sign in / sign up) | Creates JWT and sets cookie |
| `getSession()` | Server Components, API routes | Returns the current user or null |
| `verifySession()` | `middleware.ts` | Checks auth on incoming requests |
| `deleteSession()` | Sign out Server Action | Clears the cookie |

---

## Environment variables

| Variable | Purpose | Default |
|---|---|---|
| `JWT_SECRET` | Signs and verifies JWTs | `"development-secret-key"` (change in production!) |
