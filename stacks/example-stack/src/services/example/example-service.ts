import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';
import type { CustomQueryCommandOutput as QueryOutput, QueryRequest } from '@custom-repo/dynamo';

import {
  getExampleTableDescription as getExampleTableDesc,
  getExampleItemById as getExampleItemByIdRepo,
  getExampleByQuery as getExampleByQueryRepo,
  createExampleItem as createExampleItemRepo,
  updateExampleItem as updateExampleItemRepo
} from '@/repository/example-repository';
import { CustomError, formatApiResponse, logger } from '@custom-repo/global-libs';

export async function getExampleTableDescription(): Promise<APIResponse> {
  const tableDescription = await getExampleTableDesc();
  return formatApiResponse(tableDescription);
}

export async function getExampleItemById(id: string, keys?: string): Promise<Partial<object>> {
  const item = await getExampleItemByIdRepo(id, keys);

  if (!item) {
    logger.error(`Item with id ${id} not found`);
    throw new CustomError(`Item with id ${id} not found`, 404);
  }

  return item;
}

export async function getExampleItemsByQuery(queryRequest: QueryRequest): Promise<QueryOutput<Partial<object>>> {
  const response = await getExampleByQueryRepo(queryRequest);
  return response;
}

export async function createExampleItem(newItem: object): Promise<object> {
  const response = await createExampleItemRepo(newItem);
  if (!response) {
    throw new CustomError('Failed to create item', 500);
  }
  return response;
}

export async function updateExampleItem(id: string, exampleItem: object): Promise<object> {
  const response = await updateExampleItemRepo<object>({ id }, exampleItem);
  if (!response) {
    throw new CustomError('Failed to update item', 500);
  }
  return response;
}
