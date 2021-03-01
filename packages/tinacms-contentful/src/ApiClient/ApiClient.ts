import { CreateClientParams, ContentfulClientApi, ContentType, Entry as DeliveryEntry, Asset, ContentfulCollection } from 'contentful';
import { Environment } from 'contentful-management/dist/typings/entities/environment';
import { ClientAPI } from 'contentful-management/dist/typings/create-contentful-api';
import { Space as ManagementSpace } from 'contentful-management/dist/typings/entities/space';
import { Entry as ManagementEntry } from 'contentful-management/dist/typings/entities/entry';
import { ContentfulApiService } from '../ContentfulRestApi/apis';
import { handleCollection } from '../ContentfulRestApi/pagination';
import { createContentfulOperationsForEntry, Entry, getLocalizedFields, GraphOptions, Operation } from "../ContentfulRestApi/management"
import { authenticateWithContentful, getCachedBearerToken, setCachedBearerToken } from '../Authentication';
import { ContentfulUpload } from '../Media';

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
      this.allowedOrigins = this.options.allowedOrigins.split(",");
    }

    if (typeof window !== "undefined" && !this.allowedOrigins.includes(window.origin)) {
      this.allowedOrigins?.push(window.origin);
    }

    this.environment = this.options.defaultEnvironmentId;
    this.rateLimit = this.options?.rateLimit || 4;

    const bearerToken = getCachedBearerToken();

    if (bearerToken) {
      this.sdks.createManagementWithAccessToken(bearerToken);
    }
  }

  public allowedOrigins: string[] = [];
  public environment: string;
  public sdks: ContentfulApiService;
  public rateLimit: number;

  public async authenticate(popup?: Window) {
    try {
      let bearerToken = getCachedBearerToken();

      if (!bearerToken) {
        bearerToken = await authenticateWithContentful(this.options.clientId, this.options.redirectUrl, this.allowedOrigins, popup);
        
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

  public async createEntry<EntryShape = any>(contentTypeId: string, fields: EntryShape, options: {
    locale: string,
    entryId?: string,
    references?: boolean
  }) {
    const { locale } = options;
    const contentType = await this.getContentType(contentTypeId);
    const previewClient = await this.getDeliveryClient(true);
    const { env } = await this.getManagementClient();
    const localizedFields = getLocalizedFields(fields, {
      contentType,
      locale: options.locale,
      references: false
    });
    const createdEntry = typeof options.entryId !== "undefined"
      ? await env.createEntryWithId(contentTypeId, options.entryId, { fields: localizedFields })
      : await env.createEntry(contentTypeId, { fields: localizedFields })

    if (options?.references) {
      const deliveryEntry = await previewClient.getEntry(createdEntry.sys.id);

      console.log({deliveryEntry})

      deliveryEntry.fields = fields;

      console.log({deliveryEntry})

      return await this.updateEntryRecursive(deliveryEntry, null, { locale, contentType })
    }
    else {
      const localiedFieldsWithReferences = getLocalizedFields(fields, {
        contentType,
        locale: options.locale,
        references: true
      });

      createdEntry.fields = localiedFieldsWithReferences;

      createdEntry.update();
    }

    return createdEntry;
  }

  public async updateEntry<EntryShape extends Record<string, any> | unknown>(entryId: string, update: Entry<EntryShape>, options: {
    locale: string,
    initial?: Entry<EntryShape>,
    force?: boolean
  }) {
    try {
      const { locale } = options;
      const entry = await this.getEntry<EntryShape>(entryId, {
        mode: "management"
      });
      const contentType = await this.getContentType(entry.sys.contentType.sys.id);

      if (options.force !== true && update?.sys?.revision && entry.sys.version !== update.sys.revision) {
        throw new Error(`This entry was already updated by ${entry.sys.updatedBy?.sys.id} at ${new Date(entry.sys.updatedAt).toLocaleDateString()}`)
      }

      if (options?.initial) {
        return this.updateEntryRecursive(options.initial, update, { locale, contentType });
      }
      else {
        const localizedFieldsWithReferences = getLocalizedFields(update.fields, { contentType, locale: options.locale, references: true });

        entry.fields = localizedFieldsWithReferences;

        entry.update();

        return entry;
      }
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
  private async updateEntryRecursive(initial: Entry<unknown>, updated: Entry<unknown> | null = null, options: GraphOptions & { shouldDelete?: boolean, locale: string }) {
    try {
      const { create, update, dereference } = createContentfulOperationsForEntry(initial, updated, options);
      console.log({create, update, dereference })
      const failures = [];
      const createBatches = (items: any): Operation[][] => items.reduce((batches: Operation[][], item: any, i: number) => {
        const batchSize = this.rateLimit
        const batchNumber = i < batchSize ? 0 : Math.floor(i / batchSize);
        
        batches[batchNumber] = typeof batches[batchNumber] !== "undefined" ? batches[batchNumber] : [];
        batches[batchNumber].push(item);
        
        return batches;
      }, []);
      const runBatches = (batches: Operation[][]) => {
        return Promise.allSettled(batches.map(
          batch => Promise.allSettled(batch.map(
            async operation => {
              try {
                const locale = options.locale ?? operation.sys.locale

                switch (operation.type) {
                  case "create":
                    if (!operation.sys) break;
                    return this.createEntry(operation.sys.contentType?.sys.id, operation.fields, { locale, entryId: operation.sys.id });
                  case "update":
                    return this.updateEntry(operation.sys.id, operation, { locale })
                  case "dereference":
                    if (!options.shouldDelete) break;
                    return this.deleteEntry(operation.sys.id);
                }
              } catch (error) {
                console.warn(error);
                failures.push(operation);
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

      await runBatches(queues.create);
      await runBatches(queues.update);

      if (options.shouldDelete) {
        await runBatches(queues.dereference)
      }
    
      return this.getEntry(updated?.sys?.id ? updated.sys.id : initial.sys.id, { mode: "management" });
    } catch (error) {
      throw error;
    }
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

  public async createAsset(fields: ContentfulUpload, options: { locale: string }) {
    try {
      const client = await this.getManagementClient();
      const { env } = client;
      const localizedFields = getLocalizedFields(fields, { locale: options.locale, references: true });
      let asset = await env.createAssetFromFiles(localizedFields);

      asset = await asset.processForAllLocales();
      asset = await asset.publish();

      return asset;
    }
    catch (error) {
      throw error;
    }
  }

  public async updateAsset(assetId: string, update: Asset, options: { query?: any, locale: string }) {
    try {
      const client = await this.getManagementClient();
      const asset = await client.env.getAsset(assetId, options?.query ?? {});
      const localizedFields = getLocalizedFields(update.fields, {
        locale: options.locale,
        references: true
      })

      asset.fields = localizedFields;

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
      const space = await client.getSpace(this.options.spaceId);
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
