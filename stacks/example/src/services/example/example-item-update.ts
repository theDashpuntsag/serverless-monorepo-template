import { PrtExampleItem, updateExampleItemDirectly } from '@/repository/example-repository';

export async function updateExampleItem(item: PrtExampleItem): Promise<PrtExampleItem> {
  return await updateExampleItemDirectly(item);
}
