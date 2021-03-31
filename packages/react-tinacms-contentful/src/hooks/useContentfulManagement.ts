import type { ClientAPI } from 'contentful-management/dist/typings/create-contentful-api';
import { useContentful } from './useContentful';

/**
 * Retrieves the Contentful Management SDK from the CMS
 * 
 * @param spaceId When using multiple spaces, specify the space you need the client for (Optional)
 * @returns 
 */
export function useContentfulManagement(
  spaceId?: string
): ClientAPI | undefined {
  const contentful = useContentful(spaceId);

  return contentful.sdks.managementClient as unknown as ClientAPI;
}
