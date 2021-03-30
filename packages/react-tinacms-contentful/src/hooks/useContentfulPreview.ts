import { ContentfulClientApi } from 'contentful';
import { useContentful } from './useContentful';

/**
 * Retrieves the Contentful Preview SDK from the CMS
 * 
 * @param spaceId When using multiple spaces, specify the space you need the client for (Optional)
 * @returns 
 */
export function useContentfulPreview(spaceId?: string): ContentfulClientApi {
  const contentful = useContentful(spaceId);

  return contentful.sdks.previewClient;
}
