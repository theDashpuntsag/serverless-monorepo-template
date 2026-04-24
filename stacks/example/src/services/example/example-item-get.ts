import type { OptPrtExampleItem, QueriedExampleItems } from '@/repository/example-repository';
import {
  getExampleItemById as getExampleItemByIdRepo,
  getExampleItemsByQuery as getExampleItemsByQueryRepo,
  getExampleItemTableDescription,
} from '@/repository/example-repository';
import { ExampleItem } from '@/types';
import { TableDescription } from '@aws-sdk/client-dynamodb';
import { CustomError, logErrorMessage } from '@custom-repo/libs';
import { DynamoQueryRequest } from 'dynamo-command-builder';

/**
 * Retrieves the ExampleItem table description.
 * @returns The table description metadata.
 * @throws CustomError if table description not found.
 */
export async function getExampleItemTableDesc(): Promise<TableDescription> {
  try {
    const { Table } = await getExampleItemTableDescription();
    if (!Table) throw new CustomError('ExampleItem table description not found');
    const { AttributeDefinitions, GlobalSecondaryIndexes, KeySchema, TableName } = Table;
    if (!AttributeDefinitions || !GlobalSecondaryIndexes || !KeySchema || !TableName) {
      throw new CustomError('Incomplete table description for ExampleItem');
    }
    return { AttributeDefinitions, GlobalSecondaryIndexes, KeySchema, TableName };
  } catch (error: unknown) {
    logErrorMessage(error, 'getExampleItemTableDesc');
    throw error;
  }
}

/**
 * Retrieves a ExampleItem by its id.
 */
export async function getExampleItemById(id: string, proj?: string): Promise<OptPrtExampleItem> {
  try {
    return await getExampleItemByIdRepo(id, proj);
  } catch (error: unknown) {
    logErrorMessage(error, 'getExampleItemById');
    throw error;
  }
}

/**
 * Queries ExampleItems based on provided conditions.
 */
export async function getExampleItemsByQuery(query: DynamoQueryRequest, proj?: string): Promise<QueriedExampleItems> {
  try {
    return await getExampleItemsByQueryRepo(query, proj);
  } catch (error: unknown) {
    logErrorMessage(error, 'getExampleItemsByQuery');
    throw error;
  }
}

/**
 * Retrieves and validates a ExampleItem by id, throwing if not found.
 */
export async function getValidatedExampleItem(id: string): Promise<ExampleItem> {
  try {
    const entity = await getExampleItemById(id);
    if (!entity) {
      throw new CustomError('ExampleItem with id ' + id + ' not found', 404);
    }
    return entity as ExampleItem;
  } catch (error: unknown) {
    logErrorMessage(error, 'getValidatedExampleItem');
    throw error;
  }
}

/**
 * Retrieves a ExampleItem by index
 */
export async function getExampleItemByIndex(indexValue: string): Promise<OptPrtExampleItem> {
  try {
    const query: DynamoQueryRequest = {
      indexName: 'index',
      pKey: indexValue,
      pKeyType: 'S',
      pKeyProp: 'key',
    };
    const { items } = await getExampleItemsByQuery(query);
    return items.length > 0 ? items[0] : undefined;
  } catch (error: unknown) {
    logErrorMessage(error, 'getExampleItemByIndex');
    throw error;
  }
}
