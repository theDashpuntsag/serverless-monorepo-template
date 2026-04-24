import type { PrtExampleItem } from '@/repository/example-repository';
import {
  updateExampleItemByExpression as updateExampleItemByExpressionRepo,
  updateExampleItemDirectly as updateExampleItemDirectlyRepo,
} from '@/repository/example-repository';
import { CustomError, logErrorMessage } from '@custom-repo/libs';

type GenericRecord = Record<string, unknown>;

type UpdateExampleItemWithConditionInput = {
  item: PrtExampleItem;
  condition?: string;
  extraAttributeValues?: GenericRecord;
  expectedUpdatedAt?: number;
};

/**
 * Updates ExampleItem directly by passing partial item fields.
 */
export async function updateExampleItemDirectly(
  item: PrtExampleItem,
  condition?: string,
  extraAttributeValues?: GenericRecord
): Promise<PrtExampleItem> {
  try {
    return await updateExampleItemDirectlyRepo(item, condition, extraAttributeValues);
  } catch (error: unknown) {
    logErrorMessage(error, 'updateExampleItemDirectly');
    throw error;
  }
}

/**
 * Updates ExampleItem using an update expression.
 */
export async function updateExampleItemWithExpression(
  id: string,
  updateExpression: string,
  condition?: string,
  extraAttributeValues?: GenericRecord
): Promise<PrtExampleItem> {
  try {
    return await updateExampleItemByExpressionRepo(id, updateExpression, condition, extraAttributeValues);
  } catch (error: unknown) {
    logErrorMessage(error, 'updateExampleItemWithExpression');
    throw error;
  }
}

/**
 * Updates ExampleItem with a condition object and optional updatedAt version check.
 */
export async function updateExampleItemWithCondition(
  input: UpdateExampleItemWithConditionInput
): Promise<PrtExampleItem> {
  try {
    const { item, condition, extraAttributeValues, expectedUpdatedAt } = input;
    if (!item.id) throw new CustomError('ExampleItem id is required for update', 400);

    const mergedItem: PrtExampleItem = {
      ...item,
      updatedAt: Date.now(),
    };

    const conditions: string[] = [];
    if (condition) conditions.push('(' + condition + ')');
    if (expectedUpdatedAt) conditions.push('updatedAt = :expectedUpdatedAt');
    const finalCondition = conditions.length > 0 ? conditions.join(' AND ') : undefined;

    const ext: GenericRecord = { ...(extraAttributeValues ?? {}) };
    if (expectedUpdatedAt) ext[':expectedUpdatedAt'] = expectedUpdatedAt;

    return await updateExampleItemDirectlyRepo(
      mergedItem,
      finalCondition,
      Object.keys(ext).length > 0 ? ext : undefined
    );
  } catch (error: unknown) {
    logErrorMessage(error, 'updateExampleItemWithCondition');
    throw error;
  }
}
