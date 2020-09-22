import { useCMS } from 'tinacms';
import { ClientAPI } from 'contentful-management/dist/typings/create-contentful-api';
import { ContentfulClient } from '../apis/contentful';
import { useContentfulUserAuthToken } from './useContentfulUserAccessToken';

export function useContentfulManagement(
  spaceId: string
): ClientAPI | undefined {
  const cms = useCMS();
  const contentfulClient: ContentfulClient = cms.api.contentful;
  const contentful = contentfulClient[spaceId];
  const management = contentful?.managementClient;
  const [userAccessToken] = useContentfulUserAuthToken();

  if (!management && userAccessToken) {
    contentful.createManagementClientWithUserAccessToken(userAccessToken);
  }

  return management;
}
