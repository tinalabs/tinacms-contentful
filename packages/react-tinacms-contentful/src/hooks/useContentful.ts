import { useCMS } from 'tinacms';
import { ContentfulClient } from 'tinacms-contentful';

export function useContentful(spaceId?: string) {
  const cms = useCMS();
  const contentfulClient = cms.api.contentful as ContentfulClient;

  if (spaceId) {
    return (contentfulClient as any)[spaceId] as ContentfulClient;
  }

  return contentfulClient;
}
