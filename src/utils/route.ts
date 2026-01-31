const BASE_PATH = '/clhub';

/**
 * Prefixes the given path with the base path in production environment.
 * Returns the path unchanged in other environments.
 *
 * @example
 * // In production (NODE_ENV === 'production')
 * route('/about') // '/clhub/about'
 * route('/npm/react') // '/clhub/npm/react'
 *
 * // In development
 * route('/about') // '/about'
 */
export function route(path: string): string {
  if (import.meta.env.PROD) {
    // Handle paths that already start with base path
    if (path.startsWith(BASE_PATH)) {
      return path;
    }
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${BASE_PATH}${normalizedPath}`;
  }
  return path;
}
