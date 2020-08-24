import { Entry } from 'contentful';
import { ContentfulClient, ContentfulClientOptions } from '../apis/contentful';
import ContentfulDeliveryService from '../services/contentful/delivery';

export interface ContentfulPreviewPropsOptions {
  entryId: string,
  clientId: string,
  environmentId: string,
  spaceId: string,
  accessToken: string,
  query?: any
}

export async function getContentfulPreviewPropsForEntry<TDataType = any>(opts: ContentfulPreviewPropsOptions) {
  try {
    const contentful = createContentfulPreviewClient(opts);

    return await contentful[opts.spaceId].delivery.getEntry(opts.entryId, opts.query) as Entry<TDataType>;
  }
  catch (err) {
    throw err;
  }
}

export async function getContentfulPreviewPropsForEntries<TDataType = any>(opts: Omit<ContentfulPreviewPropsOptions, "entryId">) {
  try {
    const contentful = createContentfulPreviewClient(opts);

    return await ContentfulDeliveryService.GetMany<TDataType>(contentful[opts.spaceId].delivery, opts.query);
  }
  catch (err) {
    throw err;
  } 
}

function createContentfulPreviewClient(opts: Omit<ContentfulPreviewPropsOptions, "entryId">): ContentfulClient {
  const clientOpts: ContentfulClientOptions = {
    clientId: opts.clientId,
    spaceId: opts.spaceId,
    defaultEnvironmentId: opts.environmentId,
    accessTokens: {
      delivery: opts.accessToken,
      management: "" // we don't need management in this context
    }
  }
  const contentful = new ContentfulClient(clientOpts);

  return contentful;
}