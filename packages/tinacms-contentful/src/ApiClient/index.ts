import { ContentfulClientApi, ContentType } from 'contentful';
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
  private m_UserAccessToken?: string;

  public async authenticate() {
    try {
      this.m_UserAccessToken = await authenticateWithContentful(this.options.clientId, this.options.redirectUrl);
      this.sdks.createManagementClientWithUserAccessToken(this.m_UserAccessToken);

      return true;
    }
    catch (error) {
      return false;
    }
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

  public async getContentType<TContentType extends ContentType>(contentTypeId: string, options: {
    preview: boolean
  }) {
    const client = this.getDeliveryClient(options.preview);

    return await client.getContentType(contentTypeId) as TContentType;
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
