import { useCMS } from 'tinacms';
import type { ClientAPI } from 'contentful-management/dist/typings/create-contentful-api';
import { ContentfulClient } from 'tinacms-contentful';
import { useContentfulUserAuthToken } from './useContentfulUserAccessToken';

export function useContentfulManagement(
  spaceId: string
): ClientAPI | undefined {
  const cms = useCMS();
  const contentfulClient: ContentfulClient = cms.api.contentful;
  const contentful = contentfulClient[spaceId];
  // TODO: FIX THIS
  const management = contentful?.managementClient as unknown as ClientAPI;
  const [userAccessToken] = useContentfulUserAuthToken();

  if (!management && userAccessToken) {
    contentful.createManagementClientWithUserAccessToken(userAccessToken);
  }

  return undefined;
}
