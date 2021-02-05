import { CreateClientParams, ContentfulClientApi, ContentType, Entry as DeliveryEntry, Asset } from 'contentful';
import { Space } from 'contentful-management/dist/typings/entities/space';
import { Environment } from 'contentful-management/dist/typings/entities/environment';
import { ClientAPI } from 'contentful-management/dist/typings/create-contentful-api';
import { Entry as ManagementEntry } from 'contentful-management/dist/typings/entities/entry';
import { AssetFileProp } from 'contentful-management/dist/typings/entities/asset';
import { ContentfulApiService } from '../ContentfulRestApi/apis';
import { ContentfulPaginationService } from '../ContentfulRestApi/pagination';
import { createContentfulOperationsForEntry, Entry, getLocalizedFields, GraphOptions } from "../ContentfulRestApi/management"
import { authenticateWithContentful, getCachedBearerToken, setCachedBearerToken } from '../Authentication';

export type ContentfulClientOptionalOptions = Partial<Omit<CreateClientParams, "accessToken" | "space" | "environment">> & {
  allowedOrigins?: string | string[];
  deliveryClient?: ContentfulClientApi;
  previewClient?: ContentfulClientApi;
  managementClient?: ClientAPI;
  rateLimit?: number;
}

export interface ContentfulClientOptions {
  clientId: string;
  spaceId: string;
  defaultEnvironmentId: string;
  accessTokens: {
    delivery: string;
    preview: string;
    /**
     * Do not use a personal access token in the browser; 
     * this should only be set with an in-memory bearer token
     */
    management?: string;
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

    if (typeof window !== "undefined") {
      this.allowedOrigins?.push(window.location.origin);
    }

    this.environment = this.options.defaultEnvironmentId;
    this.rateLimit = options.options?.rateLimit || 4;
    this.m_BearerToken = getCachedBearerToken();

    if (this.m_BearerToken) {
      this.sdks.createManagementWithAccessToken(this.m_BearerToken);
    }
  }

  public allowedOrigins?: string[] = [];
  public environment: string;
  public sdks: ContentfulApiService;
  public rateLimit: number;
  private m_BearerToken?: string;

  public async authenticate(popup?: Window) {
    try {
      if (!this.m_BearerToken) {
        this.m_BearerToken = await authenticateWithContentful(this.options.clientId, this.options.redirectUrl, popup);
        this.sdks.createManagementWithAccessToken(this.m_BearerToken);
        
        if (this.options.options?.insecure) {
          setCachedBearerToken(this.m_BearerToken, !this.options?.options.insecure);
        }
      }
      else if (popup) {
        popup.close();
      }

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

  public async getEntry<EntryShape extends any, Management extends boolean = false>(entryId: string, options?: {
    query?: any,
    preview?: Management extends true ? false : true,
    management?: Management,
  }): Promise<Management extends true ? ManagementEntry : DeliveryEntry<EntryShape>> {
    try {
      const client = this.getDeliveryClient(options?.preview ?? false);

      if (options?.management) {
        const { env } = await this.getManagementClient();
        const entry = env.getEntry(entryId, options.query);

        // TODO: fix types
        return entry as any;
      }

      // TODO: fix types
      return client.getEntry<EntryShape>(entryId) as any;
    }
    catch (error) {
      throw error;
    }
  }

  public async getEntries<EntryShape extends any, Management extends boolean = false>(query?: any, options?: {
    preview?: Management extends true ? false : true,
    management?: Management extends true ? true : false
  }): Promise<Management extends true ? ManagementEntry[] : DeliveryEntry<EntryShape>[]> {
    try {
      const client = this.getDeliveryClient(options?.preview ?? false);

      if (options?.management) {
        const { env } = await this.getManagementClient();

        // TODO: fix types
        return ContentfulPaginationService.getMany<EntryShape>(env, query) as any;
      }

      // TODO: fix types
      return ContentfulPaginationService.getMany<EntryShape>(client, query) as any;
    }
    catch (error) {
      throw error;
    }
  }

  public async createEntry<EntryShape = any>(contentTypeId: string, fields: Entry<EntryShape>['fields'], options: {
    locale: string,
    references?: boolean
  }) {
    const previewClient = await this.getDeliveryClient(true);
    const { env } = await this.getManagementClient();
    const localizedFields = getLocalizedFields(fields, {
      locale: options.locale,
      references: false
    });
    const createdEntry = await env.createEntry(contentTypeId, {
      fields: localizedFields
    });

    if (options?.references) {
      const deliveryEntry = await previewClient.getEntry(createdEntry.sys.id);

      return await this.updateEntryRecursive(deliveryEntry, null, options)
    }
    else {
      const localizedReferenceFields = getLocalizedFields(fields, {
        locale: options.locale,
        references: true
      });

      createdEntry.fields = localizedReferenceFields;

      createdEntry.update();
    }

    return createdEntry;
  }

  public async updateEntry<EntryShape = any>(entryId: string, fields: Entry<EntryShape>['fields'], options: {
    locale: string,
    initial?: Entry<EntryShape>
  }) {
    try {
      const locale = options?.locale;
      let entry = await this.getEntry<EntryShape, true>(entryId, {
        management: true
      });

      if (options?.initial) {
        return this.updateEntryRecursive(options.initial, {
          ...options.initial,
          fields: fields
        }, {
          locale
        });
      }
      else {
        entry.fields = getLocalizedFields(fields, { locale, references: true });

        entry.update();
      }

      return entry;
    }
    catch (error) {
      throw error;
    }
  }

  /** 
   * Recurses an entry and its references, comparing it against the initial, to compute a graph of operations
   * Then runs those operations in batches according to the rate limit.
   * 
   * It expects each nested entry to have a `sys` object with `contentType` defined, otherwise it's ignored.
   * 
   * It does not reverse partially failed transactions, instead tracking them and retrying them.
   */
  private async updateEntryRecursive(initial: Entry<unknown>, updated: Entry<unknown> | null = null, options: GraphOptions) {
    const { create, update, dereference } = createContentfulOperationsForEntry(initial, updated, options);
    // const failures = [];
    // const createBatches = (items: any): Operation[][] => items.reduce((batches: Operation[][], item: any, i: number) => {
    //   const batchSize = this.rateLimit
    //   const batchNumber = i < batchSize ? 0 : Math.floor(i / batchSize);
      
    //   batches[batchNumber] = typeof batches[batchNumber] !== "undefined" ? batches[batchNumber] : [];  
    //   batches[batchNumber].push(item);
      
    //   return batches;
    // }, []);
    // const runBatches = (batches: Operation[][], operation: (operation: Operation) => void) => {
    //   return Promise.allSettled(batches.map(
    //     batch => Promise.allSettled(batch.map(
    //       operation => {
    //         const locale = options.locale ?? operation.sys.locale

    //         switch (operation.type) {
    //           case "create":
    //             if (!operation.sys) break;
    //             return this.createEntry(operation.sys.contentType?.sys.id, operation.fields, { locale });
    //           case "delete":
    //             if (!options.shouldDelete) break;
    //             return this.deleteEntry(operation.sys.id);
    //           case "update":
    //             return this.updateEntry(operation.sys.id, operation.fields, { locale: operation.sys.locale })
    //         }
    //       }
    //     ))
    //   ));
    // }
    // const queues = {
    //   create: createBatches(create),
    //   update: createBatches(update),
    //   dereference: createBatches(dereference)
    // }
  
    return this.getEntry(initial.sys.id, { management: true });
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
    query?: any,
    preview?: boolean
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

      return await ContentfulPaginationService.getManyAssets(client, query);
    }
    catch (error) {
      throw error;
    }
  }

  public async getAssetCollection(query?: any, options?: {
    preview: boolean;
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

  public async getContentType<ContentTypeShape extends ContentType>(contentTypeId: string, options?: {
    preview?: boolean
  }) {
    const client = this.getDeliveryClient(options?.preview ?? false);

    return await client.getContentType(contentTypeId) as ContentTypeShape;
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

  public async getManagementClient(): Promise<{
    client: ClientAPI,
    space: Space,
    env: Environment
  }> {
    try {
      const client: ClientAPI = this.sdks.managementClient;
      const space = await this.sdks.managementClient?.getSpace(this.options.spaceId);
      const env = await space.getEnvironment(this.environment);
      
      return {
        client,
        space,
        env
      };
    }
    catch (error) {
      throw error;
    }
  }
}
