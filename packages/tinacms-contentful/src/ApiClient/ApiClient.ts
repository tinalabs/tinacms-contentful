import { Asset, CreateClientParams, ContentfulClientApi, ContentType, Entry, Locale } from 'contentful';
import { ClientAPI } from 'contentful-management/dist/typings/create-contentful-api';
import { AssetFileProp } from 'contentful-management/dist/typings/entities/asset';
import { EntryProp } from 'contentful-management/dist/typings/entities/entry';
import { authenticateWithContentful } from '../Authentication';
import { ContentfulApiService } from '../ContentfulRestApi/apis';
import ContentfulDeliveryService from '../ContentfulRestApi/delivery';

export type ContentfulClientOptionalOptions = Partial<Omit<CreateClientParams, "accessToken" | "space" | "environment">> & {
  allowedOrigins?: string | string[];
  deliveryClient?: ContentfulClientApi;
  previewClient?: ContentfulClientApi;
  managementClient?: ClientAPI;
}

export interface ContentfulClientOptions {
  clientId: string;
  spaceId: string;
  defaultEnvironmentId: string;
  accessTokens: {
    delivery: string;
    preview: string;
  };
  redirectUrl: string;
  options?: ContentfulClientOptionalOptions
}

export class ContentfulClient {
  constructor(private options: ContentfulClientOptions) {
    const opts = options.options;

    this.sdks = new ContentfulApiService({
      ...this.options
    });

    if (opts?.allowedOrigins && Array.isArray(opts?.allowedOrigins)) {
      this.allowedOrigins = opts.allowedOrigins;
    }
    else if (opts?.allowedOrigins && typeof opts?.allowedOrigins === "string") {
      this.allowedOrigins = [opts.allowedOrigins];
    }

    if (this.currentOrigin) {
      this.allowedOrigins?.push(this.currentOrigin);
    }

    this.environment = this.options.defaultEnvironmentId;
  }

  public currentOrigin?: string = typeof window !== "undefined" ? window.location.origin : undefined;
  public allowedOrigins?: string[] = [];
  public environment: string;
  public locale!: Locale;
  public sdks: ContentfulApiService;
  private m_UserAccessToken?: string;

  public async authenticate() {
    try {
      this.m_UserAccessToken = await authenticateWithContentful(this.options.clientId, this.options.redirectUrl);
      this.sdks.createManagementWithAccessToken(this.m_UserAccessToken);

      return true;
    }
    catch (error) {
      console.error(error);
      
      return false;
    }
  }

  public async setEnvironment(environmentId: string) {
    try {
      this.sdks = new ContentfulApiService({
        ...this.options,
        environmentId: environmentId
      })
    }
    catch (error) {
      throw error;
    }

    this.environment = environmentId;
  }

  public async getDefaultLocale() {
    const locales = await this.sdks.deliveryClient.getLocales();

    const defaultLocale = locales.items.reduce((defaultLocale: Locale | undefined, locale) => {
      if (locale.default) {
        defaultLocale = locale;
      }
      
      return defaultLocale;
    }, undefined);

    if (!defaultLocale) {
      throw new Error("No default locale could be found...")
    }

    this.locale = defaultLocale;

    return defaultLocale;
  }

  public async getEntry<TEntry extends any>(entryId: string, options?: {
    query?: any
    preview?: boolean
  }) {
    try {
      const client = this.getDeliveryClient(options?.preview ?? false);

      console.warn(entryId);

      return await client.getEntry<TEntry>(entryId);
    }
    catch (error) {
      throw error;
    }
  }

  public async getEntries<TEntries extends any>(query?: any, options?: {
    preview?: boolean
  }) {
    try {
      const client = this.getDeliveryClient(options?.preview ?? false);

      return await ContentfulDeliveryService.getMany<TEntries>(client, query);
    }
    catch (error) {
      throw error;
    }
  }

  public async createEntry<TEntry = any>(contentTypeId: string, data: Pick<EntryProp, "fields" | "metadata"> ) {
    const client = await this.getManagementClient();
    
    return await client.env.createEntry(contentTypeId, data) as unknown as Entry<TEntry>;
  }

  public async updateEntry<TEntry = any>(entryId: string, data: Entry<TEntry>['fields'] | any, options?: { query?: any }) {
    try {
      const client = await this.getManagementClient();
      let entry = await client.env.getEntry(entryId, options?.query);

      entry.fields = {
        ...entry.fields,
        ...data
      }

      return await entry.update();
    }
    catch (error) {
      throw error;
    }
  }

  public async archiveEntry(entryId: string) {
    try {
      const client = await this.getManagementClient();
      let entry = await client.env.getEntry(entryId);

      return await entry.archive();
    }
    catch (error) {
      throw error;
    }
  }

  public async deleteEntry(entryId: string) {
    try {
      const client = await this.getManagementClient();
      let entry = await client.env.getEntry(entryId);

      return await entry.delete();
    }
    catch (error) {
      throw error;
    }
  }

  public async getAsset(assetId: string, options?: {
    query?: any, preview?: boolean
  }) {
    try {
      const client = this.getDeliveryClient(options?.preview ?? false);
      
      return await client.getAsset(assetId, options?.query);
    }
    catch (error) {
      throw error;
    }
  }

  public async getAssets(query?: any, options?: {
    preview?: boolean
  }) {
    try {
      const client = this.getDeliveryClient(options?.preview ?? false);

      return await ContentfulDeliveryService.getManyAssets(client, query);
    }
    catch (error) {
      throw error;
    }
  }

  public async getAssetCollection(query?: any, options?: {
    preview?: boolean;
  }) {
    try {
      const client = this.getDeliveryClient(options?.preview ?? false);

      return await client.getAssets(query);
    }
    catch (error) {
      throw error;
    }
  }

  public async createAsset(data: Pick<AssetFileProp, "fields">) {
    try {
      const client = await this.getManagementClient();
      let asset = await client.env.createAssetFromFiles(data);

      asset = await asset.processForAllLocales();
      asset = await asset.publish();

      return asset;
    }
    catch (error) {
      throw error;
    }
  }

  public async updateAsset(assetId: string, data: Asset['fields'], options?: { query?: any }) {
    try {
      const client = await this.getManagementClient();
      let asset = await client.env.getAsset(assetId, options?.query);

      asset.fields = {
        ...asset.fields,
        ...data as any
      }

      return await asset.update();
    }
    catch (error) {
      throw error;
    }
  }

  public async archiveAsset(assetId: string) {
    try {
      const client = await this.getManagementClient();
      let asset = await client.env.getAsset(assetId);

      if (asset.isPublished()) {
        await asset.unpublish();
      }

      return await asset.archive();
    }
    catch (error) {
      throw error;
    }
  }

  public async deleteAsset(assetId: string) {
    try {
      const client = await this.getManagementClient();
      let asset = await client.env.getAsset(assetId);

      if (asset.isPublished()) {
        await asset.unpublish();
      }

      return await asset.delete();
    }
    catch (error) {
      throw error;
    }
  }

  public async getContentType<TContentType extends ContentType>(contentTypeId: string, options: {
    preview: boolean
  }) {
    const client = this.getDeliveryClient(options.preview);

    return await client.getContentType(contentTypeId) as TContentType;
  }

  private getDeliveryClient(preview: boolean) {
    return preview ? this.sdks.previewClient : this.sdks.deliveryClient;
  }

  public async sync(query: any, options?: {
    preview: boolean
  }) {
    try {
      const client = this.getDeliveryClient(options?.preview ?? false);

      return await client.sync(query);
    }
    catch (error) {
      throw error
    }
  }

  private async getManagementClient() {
    try {
      const space = await this.sdks.managementClient?.getSpace(this.options.spaceId);
      const env = await space.getEnvironment(this.environment);
      
      return {
        space,
        env
      }
    }
    catch (error) {
      throw error;
    }
  }
}
