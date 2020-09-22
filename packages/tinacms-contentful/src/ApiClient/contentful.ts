import { ContentfulClientApi } from 'contentful';
import { ClientAPI } from 'contentful-management/dist/typings/create-contentful-api';
import { authenticateWithContentful } from '../Authentication';
import { ContentfulApiService } from '../services/contentful/apis';
import ContentfulDeliveryService from '../services/contentful/delivery';

export interface ContentfulClientOptions {
  clientId: string;
  spaceId: string;
  defaultEnvironmentId: string;
  accessTokens: {
    delivery: string;
    preview: string;
    management?: string;
  };
  redirectUrl: string;
  deliveryClient?: ContentfulClientApi;
  previewClient?: ContentfulClientApi;
  managementClient?: ClientAPI;
}

export class ContentfulClient {
  constructor(private options: ContentfulClientOptions) {
    this.sdks = new ContentfulApiService(this.options);
  }

  public sdks: ContentfulApiService;

  public async authenticate() {
    return await authenticateWithContentful(this.options.clientId, this.options.redirectUrl);
  }

  public async getEntry<TEntryType extends any>(entryId: string, options: {
    query: any
    preview: boolean
  }) {
    const client = this.getDeliveryClient(options.preview);

    return await client.getEntry<TEntryType>(entryId);
  }

  public async getEntries<TEntriesType extends any>(query: any, options: {
    preview: boolean
  }) {
    const client = this.getDeliveryClient(options.preview);

    return await ContentfulDeliveryService.getMany<TEntriesType>(client, query);
  }

  public async getContentType<TContentType extends any>(contentTypeId: string, options: {
    preview: boolean
  }) {
    const client = this.getDeliveryClient(options.preview);

    return await client.getContentType(contentTypeId);
  }

  public async createEntry(entryId: string) {
    // TODO: requires management client
    throw new Error("Not yet implemented");
  }

  public async updateEntry(entryId: string) {
      // TODO: requires management client
    throw new Error("Not yet implemented");
  }

  public async deleteEntry(entryId: string) {
    // TODO: requires management client
    throw new Error("Not yet implemented");
  }

  private getDeliveryClient(preview: boolean) {
    return preview ? this.sdks.previewClient : this.sdks.deliveryClient;
  }
}
