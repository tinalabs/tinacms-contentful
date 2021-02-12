import { CreateClientParams, ContentfulClientApi, ContentType, Entry as DeliveryEntry, Asset, ContentfulCollection } from 'contentful';
import { Environment } from 'contentful-management/dist/typings/entities/environment';
import { ClientAPI } from 'contentful-management/dist/typings/create-contentful-api';
import { Space as ManagementSpace } from 'contentful-management/dist/typings/entities/space';
import { Entry as ManagementEntry } from 'contentful-management/dist/typings/entities/entry';
import { AssetFileProp } from 'contentful-management/dist/typings/entities/asset';
import { ContentfulApiService } from '../ContentfulRestApi/apis';
import { handleCollection } from '../ContentfulRestApi/pagination';
import { createContentfulOperationsForEntry, Entry, getLocalizedFields, GraphOptions, Operation } from "../ContentfulRestApi/management"
import { authenticateWithContentful, getCachedBearerToken, setCachedBearerToken } from '../Authentication';

/**
 * @deprecated Renamed to SpaceOptions. This type will be removed in v1.0.0.
 */
export type Space = SpaceOptions;

export interface SpaceOptions {
  spaceId: string;
  defaultEnvironmentId: string;
  accessTokens: {
    delivery: string;
    preview: string;
  };
  options?: OptionalSpaceOptions
}

export type OptionalSpaceOptions = Partial<Omit<CreateClientParams, "accessToken" | "space" | "environment">> & {
  deliveryClient?: ContentfulClientApi;
  previewClient?: ContentfulClientApi;
}

export interface ContentfulClientOptions {
  clientId: string;
  redirectUrl: string;
  rateLimit?: number
  allowedOrigins?: string | string[];
  insecure?: boolean;
}

export type ClientMode = "delivery" | "preview" | "management"

export type getEntryOptions<Mode extends ClientMode> = {
  query?: any,
  /** @deprecated Use mode instead. Will be removed in 1.0.0 */
  preview?: boolean,
  mode?: Mode
}

export type getEntriesOptions<Mode extends ClientMode> = Omit<getEntryOptions<Mode>, 'query'>

export class ContentfulClient {
  constructor(private options: SpaceOptions & ContentfulClientOptions) {
    this.sdks = new ContentfulApiService({
      ...this.options
    });

    if (this.options.allowedOrigins && Array.isArray(this.options.allowedOrigins)) {
      this.allowedOrigins = this.options.allowedOrigins;
    }
    else if (this.options.allowedOrigins && typeof this.options.allowedOrigins === "string") {
      this.allowedOrigins = [this.options.allowedOrigins];
    }

    if (typeof window !== "undefined") {
      this.allowedOrigins?.push(window.location.origin);
    }

    this.environment = this.options.defaultEnvironmentId;
    this.rateLimit = this.options?.rateLimit || 4;

    const bearerToken = getCachedBearerToken();

    if (bearerToken) {
      this.sdks.createManagementWithAccessToken(bearerToken);
    }
  }

  public allowedOrigins?: string[] = [];
  public environment: string;
  public sdks: ContentfulApiService;
  public rateLimit: number;

  public async authenticate(popup?: Window) {
    try {
      let bearerToken = getCachedBearerToken();

      if (!bearerToken) {
        bearerToken = await authenticateWithContentful(this.options.clientId, this.options.redirectUrl, popup);
        
        if (this.options.insecure) {
          setCachedBearerToken(bearerToken, !this.options?.insecure);
        }

        this.sdks.createManagementWithAccessToken(bearerToken);
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

  public async getEntry<EntryShape extends any, Mode = "unknown">(entryId: string, options?: getEntryOptions<"delivery">): Promise<DeliveryEntry<any>>
  public async getEntry<EntryShape extends any, Mode extends ClientMode = "delivery" | "preview">(entryId: string, options?: getEntryOptions<Mode>): Promise<DeliveryEntry<any>>
  public async getEntry<EntryShape extends any, Mode extends ClientMode = "management">(entryId: string, options?: getEntryOptions<Mode>): Promise<ManagementEntry>
  public async getEntry<EntryShape extends any, Mode extends ClientMode>(entryId: string, options?: getEntryOptions<Mode>): Promise<DeliveryEntry<EntryShape> | ManagementEntry> {
    try {
      if (options?.mode === "management") {
        const { env } = await this.getManagementClient();
        const entry = env.getEntry(entryId, options.query ?? undefined);

        return entry;
      }
      else {
        const preview = options?.mode === "preview" || options?.preview === true ? true : false;
        const client = this.getDeliveryClient(preview);

        return client.getEntry<EntryShape>(entryId);
      }
    }
    catch (error) {
      throw error;
    }
  }


  public async getEntries<EntryShape extends any, Mode = unknown>(query?: any | null, options?: getEntriesOptions<"delivery">): Promise<DeliveryEntry<EntryShape>[]>;
  public async getEntries<EntryShape extends any, Mode extends ClientMode = "delivery" | "preview">(query?: any | null, options?: getEntriesOptions<Mode>): Promise<DeliveryEntry<EntryShape>[]>;
  public async getEntries<EntryShape extends any, Mode extends ClientMode = "management">(query?: any | null, options?: getEntriesOptions<Mode>): Promise<ManagementEntry[]>;
  public async getEntries<EntryShape extends any, Mode extends ClientMode = "delivery">(query?: any | null, options?: getEntriesOptions<Mode>): Promise<DeliveryEntry<EntryShape>[] | ManagementEntry[]> {
    try {
      if (options?.mode === "management") {
        const { env } = await this.getManagementClient();
        const collection = await env.getEntries(query ?? {});
        const [entries, finalCollection] = await handleCollection<ManagementEntry>(query ?? {}, collection, [], async (query) => await env.getEntries(query));

        return entries;
      }
      else {
        const preview = options?.mode === "preview" || options?.preview === true ? true : false;
        const client = this.getDeliveryClient(preview);
        const collection = await client.getEntries<EntryShape>(query ?? {}) as unknown as ContentfulCollection<DeliveryEntry<EntryShape>>;
        const [entries, finalCollection] = await handleCollection<DeliveryEntry<EntryShape>>(query ?? {}, collection, [], async (query) => {
          return await client.getEntries(query) as unknown as Promise<ContentfulCollection<DeliveryEntry<EntryShape>>>
        });

        return entries;
      }
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
      let entry = await this.getEntry<EntryShape>(entryId, {
        mode: "management"
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
    const failures = [];
    const createBatches = (items: any): Operation[][] => items.reduce((batches: Operation[][], item: any, i: number) => {
      const batchSize = this.rateLimit
      const batchNumber = i < batchSize ? 0 : Math.floor(i / batchSize);
      
      batches[batchNumber] = typeof batches[batchNumber] !== "undefined" ? batches[batchNumber] : [];  
      batches[batchNumber].push(item);
      
      return batches;
    }, []);
    const runBatches = (batches: Operation[][], operation: (operation: Operation) => void) => {
      return Promise.allSettled(batches.map(
        batch => Promise.allSettled(batch.map(
          operation => {
            const locale = options.locale ?? operation.sys.locale

            switch (operation.type) {
              case "create":
                if (!operation.sys) break;
                return this.createEntry(operation.sys.contentType?.sys.id, operation.fields, { locale });
              case "delete":
                if (!options.shouldDelete) break;
                return this.deleteEntry(operation.sys.id);
              case "update":
                return this.updateEntry(operation.sys.id, operation.fields, { locale: operation.sys.locale })
            }
          }
        ))
      ));
    }
    const queues = {
      create: createBatches(create),
      update: createBatches(update),
      dereference: createBatches(dereference)
    }
  
    return this.getEntry(initial.sys.id, { mode: "management" });
  }

  public async publishEntry(entryId: string) {
    try {
      const client = await this.getManagementClient();
      const entry = await client.env.getEntry(entryId);

      return await entry.publish();
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
    query?: any,
    preview?: boolean
  }) {
    try {
      const client = this.getDeliveryClient(options?.preview ?? false);
      
      return await client.getAsset(assetId, options?.query ?? {});
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
      const collection = await client.getAssets(query ?? {});
      const [assets, finalCollection] = await handleCollection(query ?? {}, collection, [], (query) => client.getAssets(query));

      return assets;
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

      return await client.getAssets(query ?? {});
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
      let asset = await client.env.getAsset(assetId, options?.query ?? {});

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

      return await client.sync(query ?? {});
    }
    catch (error) {
      throw error
    }
  }

  public async getManagementClient(): Promise<{
    client: ClientAPI,
    space: ManagementSpace,
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
