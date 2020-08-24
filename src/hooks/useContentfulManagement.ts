import { useCMS } from 'tinacms';
import { ContentfulClient } from '../apis/contentful';
import { ClientAPI } from 'contentful-management/dist/typings/create-contentful-api';

export function useContentfulManagement(spaceId: string): ClientAPI {
  const cms = useCMS();
  const contentfulClient: ContentfulClient = cms.api.contentful;

  return contentfulClient[spaceId]?.management as ClientAPI;
}