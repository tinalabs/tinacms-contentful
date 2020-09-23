import { useCMS } from 'tinacms';
import type { ClientAPI } from 'contentful-management/dist/typings/create-contentful-api';
import { useContentfulUserAuthToken } from './useContentfulUserAccessToken';
import { useContentful } from './useContentful';

export function useContentfulManagement(
  spaceId?: string
): ClientAPI | undefined {
  const contentful = useContentful(spaceId);
  const management = contentful.sdks.managementClient;
  const [userAccessToken] = useContentfulUserAuthToken();

  if (!management && userAccessToken) {
    // TODO: create client on the fly...
  }

  return management as unknown as ClientAPI;
}
