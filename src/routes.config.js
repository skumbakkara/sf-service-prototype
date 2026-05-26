/**
 * Single source of truth for app routes.
 * Consumed by router.js (matching, titles) and app (nav maps, nav items).
 *
 * Fields:
 *   path       - URL pattern (use :param for dynamic segments)
 *   component  - LWC component name (must be registered in app.js ROUTE_COMPONENTS)
 *   title      - Document title (string or (params) => string)
 *   navPage    - Id for nav active state and navigate({ page }) (omit to hide from nav)
 *   navLabel   - Label shown in nav bar and waffle
 *   navPath    - Optional; for dynamic routes, path used in nav links (e.g. /users/42)
 *   navHighlight - Optional; nav page id to highlight when this route is active (for child routes that don't create a tab)
 */

export const routes = [
  {
    path: '/',
    component: 'page-service-reps',
    title: 'Command Centre for Service',
    navPage: 'service-reps',
    navLabel: 'Service Reps',
  },
  {
    path: '/service-reps-accordion',
    component: 'page-service-reps-accordion',
    title: 'Service Reps — Accordion',
    navPage: 'service-reps-accordion',
    navLabel: 'Reps (Accordion)',
  },
  {
    path: '/icons',
    component: 'page-icon-test',
    title: 'Icons',
    navPage: 'icons',
    navLabel: 'Icons',
  },
  {
    path: '/users/:id',
    component: 'page-user',
    title: (params) => `User ${params.id}`,
    navPage: 'user',
    navLabel: 'User',
    navPath: '/users/42',
  },
  {
    path: '/contacts',
    component: 'page-contacts',
    title: 'Contacts',
    navPage: 'contacts',
    navLabel: 'Contacts',
  },
  {
    path: '/contacts/:id',
    component: 'page-contact-detail',
    title: (params) => `Contact ${params.id}`,
    navHighlight: 'contacts',
  },
];
