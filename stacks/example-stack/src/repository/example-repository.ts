import type {
  DescribeTableCommandOutput,
  CustomQueryCommandOutput as QueryOutput,
  QueryRequest
} from '@custom-repo/dynamo';

import { createRecord, getRecordByKey, getTableDescription, queryRecords, updateRecord } from '@custom-repo/dynamo';

const TABLE_NAME = '';

export async function getExampleTableDescription(): Promise<DescribeTableCommandOutput> {
  return await getTableDescription(TABLE_NAME);
}

export async function getExampleItemById<T>(id: string, projectionExp?: string): Promise<Partial<T> | undefined> {
  const params = {
    tableName: TABLE_NAME,
    key: { id },
    projectionExpression: projectionExp
  };

  return await getRecordByKey<T>(params);
}

export async function getExampleByQuery<T>(queryRequest: QueryRequest): Promise<QueryOutput<Partial<T>>> {
  return await queryRecords<T>({ tableName: TABLE_NAME, queryRequest });
}

export async function createExampleItem<T>(newItem: T): Promise<T> {
  return await createRecord<T>({ tableName: TABLE_NAME, item: newItem });
}

export async function updateExampleItem<T>(key: { id: string }, exampleItem: T): Promise<T | undefined> {
  return await updateRecord<T>({
    tableName: TABLE_NAME,
    key,
    item: exampleItem
  });
}
