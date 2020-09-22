import { Entry } from 'contentful';
import { ContentfulClient } from '../../apis/contentful';
import ContentfulDeliveryService from './delivery';

export interface getContentfulEntryOptions {
  entryId: string;
  spaceId: string;
  clientId: string;
  environmentId: string;
  accessToken: string;
  preview?: boolean;
  query?: any;
}

export interface getContentfulEntriesOptions
  extends Omit<getContentfulEntryOptions, 'entryId'> {
  query: any;
}

export class ContentfulSSR {
  public static async getContenfulEntry<TDataType = any>(
    opts: getContentfulEntryOptions
  ) {
    try {
      const client = ContentfulSSR.createClient(opts);

      return (await client.getEntry(opts.entryId, opts.query)) as Entry<
        TDataType
      >;
    } catch (err) {
      throw err;
    }
  }

  public static async getContentfulEntries<TDataType = any>(
    opts: getContentfulEntriesOptions
  ) {
    try {
      const client = ContentfulSSR.createClient(opts);

      return await ContentfulDeliveryService.getMany<TDataType>(
        client,
        opts.query
      );
    } catch (err) {
      throw err;
    }
  }

  private static createClient(
    opts: getContentfulEntryOptions | getContentfulEntriesOptions
  ) {
    const contentful = new ContentfulClient({
      spaceId: opts.spaceId,
      clientId: opts.clientId,
      defaultEnvironmentId: opts.environmentId,
      accessTokens: {
        delivery: opts.preview ? '' : opts.accessToken,
        preview: opts.preview ? opts.accessToken : '',
        management: '',
      },
      redirectUrl: '',
    });
    const client = opts.preview
      ? contentful[opts.spaceId].previewClient
      : contentful[opts.spaceId].deliveryClient;

    return client;
  }
}
