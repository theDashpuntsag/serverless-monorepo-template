import {
  createExampleItem,
  getExampleItemById as getExampleItemByIdService,
  getExampleItemsByQuery as getExampleItemsByQueryService,
  getExampleItemTableDesc,
  updateExampleItem
} from '@/services/example';
import { extractQueryParamsFromEvent, QueryRequestSchema } from '@custom-repo/dynamo';
import { createHttpHandler, CustomError, extractMetadata } from '@custom-repo/global-libs';

export const getExampleTableDesc = createHttpHandler<null>(async (_event) => {
  return await getExampleItemTableDesc();
});

export const getExampleItemById = createHttpHandler<null>(async (event) => {
  if (!event.pathParameters || !event.pathParameters.id) throw new CustomError(`Path variable is missing`);
  const { id } = event.pathParameters;

  const response = await getExampleItemByIdService(id);
  if (!response) throw new CustomError(`Item with id: ${id} not found`, 404);

  return response;
});

export const getExampleItemsByQuery = createHttpHandler<null>(async (event) => {
  const { queryParams } = extractMetadata(event);
  if (!queryParams) throw new CustomError('Query params are missing!');

  const parseResult = extractQueryParamsFromEvent(
    event,
    QueryRequestSchema.parse({
      indexName: 'example-index',
      pKey: 'exampleId',
      pKeyType: 'S',
      pKeyProp: 'exampleId',
      limit: '10'
    })
  );

  return await getExampleItemsByQueryService(parseResult);
});

export const postCreateExampleItem = createHttpHandler<object>(async (event) => {
  const { body } = extractMetadata(event);
  if (!body) throw new CustomError('Request body is missing');

  return await createExampleItem(body);
});

export const putUpdateExampleItem = createHttpHandler<object>(async (event) => {
  if (!event.pathParameters || !event.pathParameters.id) throw new CustomError(`Path variable is missing`);

  const { body } = extractMetadata(event);
  if (!body) throw new CustomError('Request body is missing');
  return await updateExampleItem(event.pathParameters.id, body);
});
