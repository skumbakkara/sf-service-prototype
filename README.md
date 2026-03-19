# Salesforce UI — LWC Starter Template

A **starter template** for prototyping and developing Salesforce experiences locally. Built with **LWC** (Lightning Web Components), **Vite**, **SLDS** (Salesforce Lightning Design System), and **lightning-base-components**, so you get fast builds, hot reload, and a setup that aligns with the Salesforce platform (synthetic shadow, base components, design tokens).

## Who this is for

- Developers prototyping Salesforce UIs locally before or alongside platform deployment  
- Teams designing or evaluating experiences with LWC and SLDS  
- Anyone who wants a local dev environment that matches Salesforce behavior (synthetic shadow, global SLDS styles, Lightning Base Components)

## What you get

- **App shell** — Header, global navigation, theme switcher (light/dark, SLDS 1/2), and panel layout  
- **Client-side routing** — Declarative routes in `src/router.js` with path params (e.g. `/users/:id`), History API, no full page reload  
- **SLDS + Lightning Base Components** — Design system and Salesforce component library wired and ready to use  
- **Synthetic Shadow DOM** — Matches Salesforce platform behavior so styles and DOM semantics align with production  
- **Icon setup** — Prebuild script and reserved `lightning/` namespace for SLDS icons; generated modules in `src/generated/`  
- **Example pages** — Home, Settings, Icons, and a sample parameterized page (`/users/:id`). See `src/modules/page/` and `src/modules/ui/` for patterns.

## Quick start

```bash
npm install
npm run dev
```

Dev server runs at **http://localhost:3000**. After `npm install`, **`postinstall`** fills **`public/slds/`** (SLDS 1 + SLDS 2 stylesheets under `styles/`, SLDS 1 `images/`; all gitignored). Icons for `<lightning-icon>` are generated on `dev` / `build`. To build and preview a production bundle:

```bash
npm run build
npm run preview
```

## Project structure

```
salesforce-ui/
├── src/
│   ├── modules/
│   │   ├── main/                  # App shell (main-*)
│   │   │   ├── app/               # Root app, route rendering
│   │   │   ├── globalShell/       # Layout wrapper
│   │   │   ├── globalHeader/      # Top bar
│   │   │   ├── globalNavigation/ # Nav links
│   │   │   ├── panel/             # Side panel
│   │   │   └── themeSwitcher/     # SLDS version + dark mode
│   │   ├── page/                  # Route-level views (page-*)
│   │   │   ├── home/
│   │   │   ├── user/              # e.g. /users/:id
│   │   │   ├── settings/
│   │   │   └── iconTest/
│   │   ├── ui/                    # Reusable building blocks (ui-*)
│   │   │   └── example/
│   │   └── lightning/             # Reserved — do not use
│   ├── generated/                 # Generated icon modules (do not edit)
│   ├── router.js                  # Route definitions and navigation
│   ├── slds-loader.js             # SLDS CSS loading
│   └── index.js                   # App entry point
├── scripts/
│   ├── prebuild-icons.mjs         # Icon codegen (run via npm scripts)
│   └── sync-slds-css.mjs          # SLDS 1 styles+images, SLDS 2 CSS → public/ (postinstall / dev / build)
├── index.html
├── vite.config.js
└── package.json
```

### Component namespaces

Folder-based namespaces under `src/modules/` define the LWC tag prefix:

| Folder        | Tag prefix | Use for |
|---------------|------------|--------|
| **main/**     | `main-*`   | App shell only (e.g. `main-app`, `main-global-header`). Not for feature pages. |
| **page/**     | `page-*`   | Route-level views (one per URL). e.g. `page-user` → `/users/:id`. |
| **ui/**       | `ui-*`     | Reusable building blocks (cards, buttons, modals). Used inside pages or other components. |
| **lightning/**| —          | **Do not use.** Reserved for lightning-base-components and icon templates. |

Only add components under **page/** or **ui/**. Do not add custom components under **lightning/**.

**Examples:** Add `src/modules/page/dashboard/` → register in router and app, use as `page-dashboard` on e.g. `/dashboard`. Add `src/modules/ui/card/` → use in templates as `<ui-card>`.

## Using this as a template

1. Clone or copy the repo, then `npm install` and `npm run dev`.
2. **Add a page:** Create a folder under `src/modules/page/<name>/`, then:
   - Add a route in `src/routes.config.js` (e.g. `{ path: '/dashboard', component: 'page-dashboard', title: 'Dashboard', navPage: 'dashboard', navLabel: 'Dashboard' }`).
   - In `src/modules/main/app/app.js`, import the component and add it to `ROUTE_COMPONENTS`.
   - For child routes under an existing tab (e.g. `/contacts/:id`), use `navHighlight: '<parentNavPage>'` instead of `navPage` so the parent tab is highlighted without creating a new nav entry.
3. **Add a reusable component:** Create a folder under `src/modules/ui/<name>/` and use it as `<ui-<name>>` in any page or other component.
4. Follow the namespace rules above and the SLDS/LWC conventions referenced in this repo (e.g. `.cursor/rules` if present).

**Modals:** For modal dialogs, extend `LightningModal` from `lightning/modal` and use the in-repo example as your starting point: `src/modules/ui/demoModal/`. It shows the correct structure (header → body → footer with `lightning-modal-header`, `lightning-modal-body`, `lightning-modal-footer`) and opening via `MyModal.open({ size, label })`. Do not implement modals with raw SLDS modal markup.

## Routing

The app uses a small client-side router in `src/router.js`:

- **Route config** — Routes are defined in `src/routes.config.js` as `{ path, component, title, navPage?, navLabel?, navPath?, navHighlight? }`. `title` can be a string or function of route params.
- **Path params** — Use `:id` (e.g. `/users/:id`); params are available to the page component via `getCurrentRoute()` from `src/router.js`.
- **Nav tabs** — Only routes with `navPage` create a tab in the global nav. Child routes that should highlight a parent tab use `navHighlight` instead (e.g. `navHighlight: 'contacts'` on `/contacts/:id`).
- **Navigation** — Use `navigate(path)` from the router; the app shell subscribes to route changes and renders the matching `page-*` component.
- **History** — Uses the History API; back/forward work without full page reload.

## Tech stack and dependencies

- **vite** — Build tool and dev server  
- **vite-plugin-lwc** — LWC support for Vite  
- **lwc** — Lightning Web Components framework  
- **@lwc/synthetic-shadow** — Synthetic shadow DOM (Salesforce-like)  
- **lightning-base-components** — Salesforce component library  
- **@salesforce-ux/design-system** — Classic SLDS; sync copies `assets/styles/salesforce-lightning-design-system.min.css` (only that stylesheet) and `assets/images/` → `public/slds/`  
- **@salesforce-ux/design-system-2** — SLDS 2 / Cosmos (`dist/css/slds2.cosmos.css` → `public/slds/styles/slds2.cosmos.css`)  
- **`npm run sync-slds-css`** and **`postinstall`** run that script. **`public/slds/`** is **gitignored**; version bumps show up in `package.json` / the lockfile only. **`public/images/`** (e.g. favicon `salesforce.svg`) stays in the repo as app-owned assets.

## SLDS 1 and SLDS 2

The app loads **two** global stylesheets from `index.html` and toggles them via `src/slds-loader.js` (theme switcher): **SLDS 2** (`public/slds/styles/slds2.cosmos.css`) and **SLDS 1** (`public/slds/styles/salesforce-lightning-design-system.min.css`), plus SLDS 1 image assets under `public/slds/images/` for `url(...)` references in the SLDS 1 CSS. Icon templates come from **lightning-base-components** via `prebuild-icons.mjs`. Resync: `npm run sync-slds-css`. If you install with **`npm ci --ignore-scripts`**, run that (or `npm run dev` / `npm run build`) before loading the app.

## Shadow DOM (synthetic vs native)

This template uses **Synthetic Shadow DOM** so behavior and styling match the Salesforce platform.

| Feature        | Synthetic Shadow (default) | Native Shadow   |
|----------------|----------------------------|-----------------|
| Platform match | Matches Salesforce          | Different       |
| Global styles  | Penetrate components       | Blocked         |
| DOM queries    | Can query inside components| Cannot query in |
| `shadowRoot`   | `null`                     | ShadowRoot      |

**Verify:** In the browser console at http://localhost:3000 run `document.querySelector('main-app').shadowRoot` — `null` means synthetic shadow is active.

**Switch to native shadow:** In `vite.config.js` set `disableSyntheticShadowSupport: true` in the LWC plugin options.

**Why synthetic?** Matches Salesforce platform behavior, allows global SLDS styles to apply, simplifies migration of components to the platform, and keeps DOM inspectable for tests and tooling.

## Icons

SLDS icons are generated by a prebuild step. Run `npm run dev` or `npm run build` so `scripts/prebuild-icons.mjs` runs and updates `src/generated/`. The reserved `lightning/` namespace is used for icon SVG templates; do not add your own components there.

## Conventions and design system

The project follows SLDS and LWC best practices: prefer Lightning Base Components, then SLDS utility classes, then styling hooks for customisation. For detailed guidance (e.g. tokens, components, accessibility), see the [Lightning Design System](https://lightningdesignsystem.com) and [Lightning Web Components](https://developer.salesforce.com/docs/component-library/documentation/en/lwc) documentation. This repo may include additional conventions (e.g. in `.cursor/rules`).

## Deployment and platform

This template is for **local development and prototyping**. Deploying to the Salesforce platform (e.g. as an LWC-based experience or in a specific product) follows standard Salesforce deployment and may require product-specific configuration; it is out of scope for this README.

## References

- [Lightning Design System](https://lightningdesignsystem.com)  
- [Lightning Web Components (Salesforce)](https://developer.salesforce.com/docs/component-library/overview/components)  
- [LWC (OSS) / vite-plugin-lwc](https://github.com/salesforce/lwc) — for local LWC + Vite behavior
