import { Entry } from 'contentful';
import { ContentfulClient, ContentfulClientOptions } from '../apis/contentful';

export interface ContentfulPreviewPropsOptions {
  entryId: string,
  clientId: string,
  spaceId: string,
  accessToken: string
}

export async function getContentfulPreviewPropsForEntry<TDataType = any>({entryId, clientId, spaceId, accessToken}: ContentfulPreviewPropsOptions) {
  const clientOpts: ContentfulClientOptions = {
    clientId: clientId,
    spaceId: spaceId,
    accessTokens: {
      delivery: accessToken,
      management: ""
    }
  }
  const contentful = new ContentfulClient(clientOpts);

  return await contentful[spaceId].delivery.getEntry(entryId) as Entry<TDataType>;
}