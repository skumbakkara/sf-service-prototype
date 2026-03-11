/**
 * Mini router for LWC – declarative routes, dynamic params, History API.
 * No page refresh; back/forward supported.
 */

const DEFAULT_TITLE = 'Salesforce';

const routes = [
  { path: '/', component: 'page-home', title: 'Home' },
  { path: '/icons', component: 'page-icon-test', title: 'Icons' },
  { path: '/settings', component: 'page-settings', title: 'Settings' },
  { path: '/users/:id', component: 'page-user', title: (params) => `User ${params.id}` },
];

const listeners = new Set();

function matchRoute(path) {
  for (const route of routes) {
    const keys = [];
    const pattern = route.path.replace(/:([^/]+)/g, (_, key) => {
      keys.push(key);
      return '([^/]+)';
    });

    const regex = new RegExp(`^${pattern}$`);
    const match = path.match(regex);

    if (match) {
      const params = {};
      keys.forEach((k, i) => (params[k] = match[i + 1]));

      return { ...route, params };
    }
  }

  return null;
}

function getTitleForRoute(route) {
  if (!route?.title) return DEFAULT_TITLE;
  return typeof route.title === 'function'
    ? route.title(route.params || {})
    : route.title;
}

function notify() {
  const route = matchRoute(window.location.pathname);
  document.title = getTitleForRoute(route);
  listeners.forEach((cb) => cb(route));
}

export function navigate(path) {
  history.pushState({}, '', path);
  notify();
}

export function getCurrentRoute() {
  return matchRoute(window.location.pathname);
}

export function subscribe(callback) {
  listeners.add(callback);
  const route = matchRoute(window.location.pathname);
  document.title = getTitleForRoute(route);
  callback(route);

  return () => listeners.delete(callback);
}

window.addEventListener('popstate', notify);
