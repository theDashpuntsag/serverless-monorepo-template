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
 * Creates a factory bound to a specific directory, so `dir` doesn't need to
 * be repeated on every `createDefaultFunction` call in the same file.
 *
 * @example
 * const defineFunction = createFunctionFactory(__dirname);
 * export const MY_FUNCS = {
 *   myHandler: defineFunction({ fnName: 'myHandler' }),
 * };
 */
export function createFunctionFactory(dir: string) {
  return (params: Omit<FuncParams, 'dir'>) => createDefaultFunction({ ...params, dir });
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
  const { method, path: url, more } = http;

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

/**
 * Creates a factory bound to a specific directory, so `dir` doesn't need to
 * be repeated on every `createDefaultApiFunction` call in the same file.
 *
 * @example
 * const defineApi = createApiFunctionFactory(__dirname);
 * export const APIS_EXAMPLE = {
 *   getItem: defineApi({ fnName: 'getItem', http: { method: 'GET', url: '/v1/item/{id}' } }),
 * };
 */
export function createApiFunctionFactory(dir: string) {
  return (params: Omit<ApiFuncParams, 'dir'>) => createDefaultApiFunction({ ...params, dir });
}
