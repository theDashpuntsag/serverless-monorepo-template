import type { ExampleItem } from '@/@types/';
import { updateExampleItem as updateExampleItemRepo } from '@/repository/example-repository';
import { CustomError } from '@custom-repo/global-libs';
import { getExampleItemById } from './';

export async function updateExampleItem(id: string, update: object): Promise<ExampleItem> {
  const item = (await getExampleItemById(id)) as ExampleItem;
  if (!item) throw new CustomError(`Item with id: id not found`, 404);

  return await updateExampleItemRepo({ ...update, ...item } as ExampleItem);
}
