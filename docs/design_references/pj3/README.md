# LegacyBridge

An Axis-matched dark product experience built around the LegacyBridge concept brief: a responsive marketing site, themed authentication, and an operational workspace with monochrome typography, indigo lighting, dimensional product scenes, and interactive simulations.

## Run locally

```bash
npm install
npm run dev
```

Vite serves the app on `http://localhost:5173` by default.

## Routes

- `/` — Axis-style landing page and interactive task-runner demo
- `/login` — themed Clerk sign-in, or an explicitly labelled UI preview without a key
- `/sign-up` — themed Clerk sign-up, or an explicitly labelled UI preview without a key
- `/dashboard` — protected workspace when Clerk is configured; explorable sample workspace otherwise

## Enable Clerk authentication

1. Create a Clerk application and configure the sign-in methods you want to offer.
2. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Add your **publishable** key to `.env.local`:

   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   ```

4. Restart the Vite server after changing the environment file.

With a valid key, the app mounts `ClerkProvider`, uses Clerk's real `SignIn`, `SignUp`, and `UserButton` components, and redirects signed-out visitors from `/dashboard` to `/login`. Without a key, no authentication is simulated: the forms are marked **UI preview**, the submit action is labelled **Preview dashboard**, and the workspace is marked **Preview workspace · sample data**.

Only the publishable key belongs in this Vite frontend. Never put a Clerk secret key in a `VITE_` variable or commit it to the repository.

For production hosting, configure the matching Clerk production instance and allowed URLs. Because this is a client-routed SPA, also configure your host to rewrite `/login`, `/sign-up`, and `/dashboard` to `index.html` so direct visits and refreshes work.

## Production build

```bash
npm run build
npm run preview
```

## Included

### Landing page

- Responsive, mobile-first navigation and layouts
- Axis-style 92px hero, pill navigation, particle beam, and tilted analytics dashboard
- Dual logo marquees, dimensional feature cards, split agent/validator panels, and a perspective scheduling scene
- Reliability, use-case, CTA, and oversized-word footer sections
- Interactive simulated task runner with editable prompts and schedules
- Slack, Google Sheets, webhook, and PostgreSQL destinations
- Animated run trace, table/JSON/run-log views, clipboard copy, and JSON download
- Four loadable use-case presets
- Original idea brief available from the footer

### Authentication and dashboard

- Axis-themed split-screen sign-in and sign-up layouts
- Conditional real Clerk authentication through `VITE_CLERK_PUBLISHABLE_KEY`
- Explicit no-key preview mode rather than pretend authentication
- Reference-matched navy/teal Operations Command Center and responsive mobile sidebar
- Enterprise metrics that update from zero as tasks are created and runs complete
- Interactive pipeline architecture with inspectable layers and animated playback
- Task Library with status filters and Task Builder Studio creation flow
- Run Console with live statuses, detailed traces, schema validation, and delivery information
- Audit History with an approval/rejection flow for proposed writes
- Integrations & Vault with destination connection checks and secure credential references
- Workspace synchronization feedback and a keyboard command palette with `Ctrl+K` or `Cmd+K`

All portal activity and workspace data are simulated sample data. Performance figures are labelled as illustrative targets from the concept brief. Authentication becomes real only when a valid Clerk publishable key is configured; no live Clerk key is included in this project.
