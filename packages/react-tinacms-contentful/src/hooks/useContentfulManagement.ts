import type { ClientAPI } from 'contentful-management/dist/typings/create-contentful-api';
import { useContentful } from './useContentful';

export function useContentfulManagement(
  spaceId?: string
): ClientAPI | undefined {
  const contentful = useContentful(spaceId);
  const management = contentful.sdks.managementClient;

  return management as unknown as ClientAPI;
}
