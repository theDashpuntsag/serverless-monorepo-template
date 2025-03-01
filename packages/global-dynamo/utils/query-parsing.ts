import type { ValidatedAPIGatewayProxyEvent } from '@custom-repo/global-libs';
import type { QueryRequest } from '../types';

import { QueryRequestSchema } from '../types';
import { CustomError, logger } from '@custom-repo/global-libs';

type EventType = ValidatedAPIGatewayProxyEvent<object | null>;

/**
 * Extracts and validates query parameters from an API Gateway event, merging them with default query values.
 *
 * @param event - The API Gateway event containing query string parameters
 * @param query - Default query parameters to fall back to or merge with
 * @returns Validated QueryRequest object containing the merged and parsed parameters
 * @throws CustomError - If the parsed parameters don't match the QueryRequestSchema
 *
 * The function:
 * 1. Extracts query parameters from the event (defaults to empty object if none exist)
 * 2. If no index is provided or matches the default query's index:
 *    - Uses default query with a default limit of 10
 *    - Validates against schema
 * 3. Otherwise:
 *    - Merges event query params with defaults
 *    - Includes optional parameters only if present
 *    - Validates the merged result
 *
 * Example usage:
 * ```typescript
 * const event = {
 *   queryStringParameters: {
 *     index: "users",
 *     pKey: "userId",
 *     limit: "5"
 *   }
 * };
 * const defaultQuery = {
 *   indexName: "users",
 *   pKey: "defaultId"
 * };
 *
 * try {
 *   const result = extractQueryParamsFromEvent(event, defaultQuery);
 *   // Returns: {
 *   //   indexName: "users",
 *   //   pKey: "userId",
 *   //   limit: "5"
 *   // }
 * } catch (error) {
 *   // Handles validation errors
 * }
 * ```
 */
export function extractQueryParamsFromEvent(event: EventType, query: QueryRequest): QueryRequest {
  // Get query parameters from event, default to empty object if undefined
  const queryParams = event.queryStringParameters || {};

  // Check if index is absent or matches the default query's index
  if (queryParams.index === query.indexName) {
    const parseResult = QueryRequestSchema.safeParse({
      indexName: query.indexName,
      pKey: queryParams.pKey || query.pKey,
      pKeyType: queryParams.pKeyType || query.pKeyType,
      pKeyProp: queryParams.pKeyProps || query.pKeyProp,
      limit: queryParams.limit || query.limit || '10',
      sKey: queryParams.sKey || query.sKey,
      sKeyType: queryParams.sKeyType || query.sKeyType,
      sKeyProp: queryParams.sKeyProp || query.sKeyProp,
      skValue2: queryParams.skValue2 || query.skValue2,
      skValue2Type: queryParams.skValue2Type || query.skValue2Type,
      skComparator: queryParams.skComparator || query.skComparator,
      lastEvaluatedKey: queryParams.lastEvaluatedKey || query.lastEvaluatedKey,
      sorting: queryParams.sorting || query.sorting
    });

    // Throw error if validation fails, including problematic field names
    if (!parseResult.success) {
      logger.warn(`Bad request!, ${parseResult.error.errors.map((err) => err.path).join(', ')}`);
      throw new CustomError(`Bad request!, ${parseResult.error.errors.map((err) => err.path).join(', ')}`, 400);
    }
    return parseResult.data;
  }

  // Validate the merged parameters against the schema
  const parseResult = QueryRequestSchema.safeParse({
    indexName: queryParams.index,
    pKey: queryParams.pKey || query.pKey,
    pKeyType: queryParams.pKeyType || query.pKeyType,
    pKeyProp: queryParams.pKeyProps || query.pKeyProp,
    limit: queryParams.limit || '10', // Default limit if not specified
    ...(queryParams.sKey && { sKey: queryParams.sKey }),
    ...(queryParams.sKeyType && { sKeyType: queryParams.sKeyType }),
    ...(queryParams.sKeyProp && { sKeyProp: queryParams.sKeyProp }),
    ...(queryParams.skValue2 && { skValue2: queryParams.skValue2 }),
    ...(queryParams.skValue2Type && { skValue2Type: queryParams.skValue2Type }),
    ...(queryParams.skComparator && { skComparator: queryParams.skComparator }),
    ...(queryParams.limit && { limit: queryParams.limit }),
    ...(queryParams.lastEvaluatedKey && { lastEvaluatedKey: queryParams.lastEvaluatedKey }),
    ...(queryParams.sorting && { sorting: queryParams.sorting })
  });

  // Throw error if validation fails, including problematic field names
  if (!parseResult.success) {
    logger.warn(`Bad request!, ${parseResult.error.errors.map((err) => err.path).join(', ')}`);
    throw new CustomError(`Bad request!, ${parseResult.error.errors.map((err) => err.path).join(', ')}`, 400);
  }

  return parseResult.data;
}
