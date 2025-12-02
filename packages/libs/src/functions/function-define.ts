import { ApiFuncParams, FuncParams } from './function.types';

/**
 * Generates a normalized pathname relative to the project root.
 * Optimized to avoid multiple string operations.
 */
export function generatePathname(context: string): string {
  const cwd = process.cwd();
  return context.startsWith(cwd) ? context.slice(cwd.length + 1).replace(/\\/g, '/') : context.replace(/\\/g, '/');
}

/**
 * Returns a default Lambda function configuration.
 *
 * @param dir - Directory path containing the handler
 * @param fnName - Name of the handler function
 * @param other - Additional Lambda configuration options
 * @returns Lambda function configuration object
 */
export function createDefaultFunction(params: FuncParams) {
  const { dir, fnName, other } = params;
  return {
    handler: `${generatePathname(dir)}/handler.${fnName}`,
    ...(other ?? {}),
  };
}

/**
 * Returns a default API Lambda function configuration with HTTP event.
 *
 * @param dir - Directory path containing the handler
 * @param fn - Name of the handler function
 * @param http - HTTP event configuration
 * @param other - Additional Lambda configuration options
 * @returns Lambda function configuration with HTTP event
 */
export function createDefaultApiFunction(params: ApiFuncParams) {
  const { dir, fnName: fn, http, other } = params;
  const { method, url, more } = http;

  return {
    handler: `${generatePathname(dir)}/handler.${fn}`,
    events: [
      {
        http: {
          method,
          path: url,
          ...(more ?? {}),
        },
      },
    ],
    ...(other ?? {}),
  };
}
