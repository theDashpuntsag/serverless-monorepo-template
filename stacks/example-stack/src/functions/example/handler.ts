import type { CustomAPIGatewayEvent as ApiFunc } from '@custom-repo/global-libs';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

import {
  getExampleTableDescription,
  getExampleItemById as getExampleItemByIdService,
  getExampleItemsByQuery as getExampleItemsByQueryService,
  createExampleItem,
  updateExampleItem
} from '@/services/example';
import { CustomError, extractMetadata, formatApiResponse, handleApiFuncError, middyfy } from '@custom-repo/global-libs';
import { QueryRequestSchema } from '@custom-repo/dynamo';

const getExampleTableDescFunc: ApiFunc<null> = async (): Promise<ApiFuncRes> => {
  try {
    return await getExampleTableDescription();
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const getExampleItemByIdFunc: ApiFunc<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id) throw new CustomError(`Path variable is missing`);
    const { id } = event.pathParameters;

    const response = await getExampleItemByIdService(id);

    return formatApiResponse(response);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const getExampleItemsByQueryFunc: ApiFunc<null> = async (event): Promise<ApiFuncRes> => {
  try {
    const { queryParams } = extractMetadata(event);
    if (!queryParams) throw new CustomError('Query params are missing!');
    const parseResult = QueryRequestSchema.safeParse({ indexName: queryParams.index, ...queryParams });

    if (!parseResult.success) {
      const validationErrors = parseResult.error.errors.map((err) => err.path).join(', ');
      throw new CustomError(`Query params are missing!, ${validationErrors}`);
    }

    const response = await getExampleItemsByQueryService(parseResult.data);

    return formatApiResponse(response);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const postCreateExampleItemFunc: ApiFunc<object> = async (event): Promise<ApiFuncRes> => {
  try {
    const { body } = extractMetadata(event);
    if (!body) throw new CustomError('Request body is missing');
    return formatApiResponse(await createExampleItem(body as object));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const putUpdateExampleItemFunc: ApiFunc<object> = async (event): Promise<ApiFuncRes> => {
  try {
    const { body } = extractMetadata(event);
    if (!body) throw new CustomError('Request body is missing');
    return formatApiResponse(await updateExampleItem(body as object));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

export const getExampleTableDesc = middyfy(getExampleTableDescFunc);
export const getExampleItemById = middyfy(getExampleItemByIdFunc);
export const getExampleItemsByQuery = middyfy(getExampleItemsByQueryFunc);
export const postCreateExampleItem = middyfy(postCreateExampleItemFunc);
export const putUpdateExampleItem = middyfy(putUpdateExampleItemFunc);
