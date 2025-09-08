import {
  getExampleTableDescription,
  getExampleItemById as getExampleItemByIdService,
  getExampleItemsByQuery as getExampleItemsByQueryService,
  createExampleItem,
  updateExampleItem
} from '@/services/example';
import { createApiGatewayFunction, CustomError, extractMetadata } from '@custom-repo/global-libs';
import { QueryRequestSchema } from '@custom-repo/dynamo';

export const getExampleTableDesc = createApiGatewayFunction(async (_event) => {
  return await getExampleTableDescription();
});

export const getExampleItemById = createApiGatewayFunction(async (event) => {
  if (!event.pathParameters || !event.pathParameters.id) throw new CustomError(`Path variable is missing`);
  const { id } = event.pathParameters;

  return await getExampleItemByIdService(id);
});

export const getExampleItemsByQuery = createApiGatewayFunction(async (event) => {
  const { queryParams } = extractMetadata(event);
  if (!queryParams) throw new CustomError('Query params are missing!');

  const parseResult = QueryRequestSchema.safeParse({ indexName: queryParams.index, ...queryParams });

  if (!parseResult.success) {
    const validationErrors = parseResult.error.issues.map((err) => err.path.join('.')).join(', ');
    throw new CustomError(`Query params are missing!, ${validationErrors}`);
  }

  return await getExampleItemsByQueryService(parseResult.data);
});

export const postCreateExampleItem = createApiGatewayFunction<object>(async (event) => {
  const { body } = extractMetadata(event);
  if (!body) throw new CustomError('Request body is missing');

  return await createExampleItem(body as object);
});

export const putUpdateExampleItem = createApiGatewayFunction<object>(async (event) => {
  if (!event.pathParameters || !event.pathParameters.id) throw new CustomError(`Path variable is missing`);

  const { body } = extractMetadata(event);
  if (!body) throw new CustomError('Request body is missing');
  return await updateExampleItem(event.pathParameters.id, body as object);
});
