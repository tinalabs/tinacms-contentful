import { useCMS } from 'tinacms';
import { ContentfulClient } from '../apis/contentful';

export function useContentfulManagement(spaceId: string) {
  const cms = useCMS();
  const contentfulClient: ContentfulClient = cms.api.contentful;

  return contentfulClient[spaceId]?.management;
}