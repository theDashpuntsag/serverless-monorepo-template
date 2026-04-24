import { createExampleItem as createExampleItemRepo } from '@/repository/example-repository';
import type { ExampleItem } from '@/types';
import { logErrorMessage } from '@custom-repo/libs';

/**
 * Creates a new ExampleItem.
 */
export async function createExampleItem(newItem: ExampleItem): Promise<ExampleItem> {
  try {
    return await createExampleItemRepo(newItem);
  } catch (error: unknown) {
    logErrorMessage(error, 'createExampleItem');
    throw error;
  }
}
