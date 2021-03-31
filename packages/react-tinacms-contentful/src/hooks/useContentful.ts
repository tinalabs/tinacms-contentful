import { useCMS } from 'tinacms';
import { ContentfulClient } from 'tinacms-contentful';

/**
 * Retrieves the ContentfulClient from the CMS
 * 
 * @param spaceId When using multiple spaces, specify the space you need the client for (Optional)
 * @returns 
 */
export function useContentful(spaceId?: string) {
  const cms = useCMS();
  const contentfulClient = cms.api.contentful as ContentfulClient;

  if (spaceId) {
    return (contentfulClient as any)[spaceId] as ContentfulClient;
  }

  return contentfulClient;
}
