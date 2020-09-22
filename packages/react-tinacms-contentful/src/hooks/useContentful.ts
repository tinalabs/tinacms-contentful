import { ContentfulClientApi } from 'contentful';
import { useCMS } from 'tinacms';
import { ContentfulClient } from 'tinacms-contentful';

export function useContentful(spaceId: string): ContentfulClientApi {
  const cms = useCMS();
  const contentfulClient: ContentfulClient = cms.api.contentful;

  return contentfulClient[spaceId]?.deliveryClient;
}
