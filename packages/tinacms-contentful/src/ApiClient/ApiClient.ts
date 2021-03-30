import { CreateClientParams, ContentfulClientApi, ContentType, Entry as DeliveryEntry, Asset, ContentfulCollection } from 'contentful'
import { Environment } from 'contentful-management/dist/typings/entities/environment'
import { ClientAPI } from 'contentful-management/dist/typings/create-contentful-api'
import { Space as ManagementSpace } from 'contentful-management/dist/typings/entities/space'
import { Entry as ManagementEntry } from 'contentful-management/dist/typings/entities/entry'
import { ContentfulApiService } from '../ContentfulRestApi/apis'
import { handleCollection } from '../ContentfulRestApi/pagination'
import { createContentfulOperationsForEntry, Entry, getLocalizedFields, GraphOptions, Operation } from "../ContentfulRestApi/management"
import { authenticateWithContentful, getCachedBearerToken, setCachedBearerToken } from '../Authentication'
import { ContentfulUpload } from '../Media'

/**
 * @deprecated Renamed to SpaceOptions. This type will be removed in v1.0.0.
 */
export type Space = SpaceOptions

export interface SpaceOptions {
  spaceId: string
  defaultEnvironmentId: string
  accessTokens: {
    delivery: string
    preview: string
  }
  options?: OptionalSpaceOptions
}

export type OptionalSpaceOptions = Partial<Omit<CreateClientParams, "accessToken" | "space" | "environment">> & {
  deliveryClient?: ContentfulClientApi
  previewClient?: ContentfulClientApi
}

export interface ContentfulClientOptions {
  clientId: string
  redirectUrl: string
  rateLimit?: number
  allowedOrigins?: string | string[]
  insecure?: boolean
}

export type ClientMode = "delivery" | "preview" | "management"

export type getEntryOptions<Mode extends ClientMode> = {
  locale?: string,
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
    })

    if (this.options.allowedOrigins && Array.isArray(this.options.allowedOrigins)) {
      this.allowedOrigins = this.options.allowedOrigins
    }
    else if (this.options.allowedOrigins && typeof this.options.allowedOrigins === "string") {
      this.allowedOrigins = this.options.allowedOrigins.split(",")
    }

    if (typeof window !== "undefined" && !this.allowedOrigins.includes(window.origin)) {
      this.allowedOrigins?.push(window.origin)
    }

    this.environment = this.options.defaultEnvironmentId
    this.rateLimit = this.options?.rateLimit || 4

    const bearerToken = getCachedBearerToken()

    if (bearerToken) {
      this.sdks.createManagementWithAccessToken(bearerToken)
    }
  }

  public allowedOrigins: string[] = []
  public environment: string
  public sdks: ContentfulApiService
  public rateLimit: number

  /**
   * Triggers the Contentful OAuth workflow for this client.
   * 
   * @param popup A window to run the Oauth workflow in. Creates a new popup window if undefined.
   */
  public async authenticate(popup?: Window) {
    try {
      let bearerToken = getCachedBearerToken()

      if (!bearerToken) {
        bearerToken = await authenticateWithContentful(this.options.clientId, this.options.redirectUrl, this.allowedOrigins, popup)
        
        if (this.options.insecure) {
          setCachedBearerToken(bearerToken, !this.options?.insecure)
        }

        this.sdks.createManagementWithAccessToken(bearerToken)
      }
      else if (popup) {
        popup.close()
      }

      return true
    }
    catch (error) {
      console.error(error)
      
      return false
    }
  }

  /**
   * Sets the Contentful environment the API client is communicating with 
   * 
   * @param environmentId 
   */
  public async setEnvironment(environmentId: string) {
    try {
      this.sdks = new ContentfulApiService({
        ...this.options,
        environmentId: environmentId
      })
    }
    catch (error) {
      throw error
    }

    this.environment = environmentId
  }

  /**
   * Fetches a single entry
   * 
   * @param entryId The ID of entry to fetch
   * @param options.locale The locale to fetch. Uses the space default if undefined.
   * @param options.query The Contentful query/search parameters to use to fetch entries. See: https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/search-parameters
   * @param options.mode What mode to run the request in ("delivery", "preview", or "management")
   */
  public async getEntry<EntryShape extends any, Mode = unknown>(entryId: string, options?: getEntryOptions<"delivery">): Promise<DeliveryEntry<any>>
  public async getEntry<EntryShape extends any, Mode = "management">(entryId: string, options?: getEntryOptions<"management">): Promise<ManagementEntry>
  public async getEntry<EntryShape extends any, Mode extends "delivery" | "preview">(entryId: string, options?: getEntryOptions<Mode>): Promise<DeliveryEntry<any>>
  public async getEntry<EntryShape extends any, Mode extends ClientMode = "delivery">(entryId: string, options?: getEntryOptions<Mode>): Promise<DeliveryEntry<EntryShape> | ManagementEntry> {
    try {
      if (options?.mode === "management") {
        const { env } = await this.getManagementClient()
        const entry = env.getEntry(entryId, options.query ?? undefined)

        return entry
      }
      else {
        const preview = options?.mode === "preview" || options?.preview === true ? true : false
        const client = this.getDeliveryClient(preview)

        return client.getEntry<EntryShape>(entryId)
      }
    }
    catch (error) {
      throw error
    }
  }


  /**
   * Fetches an array of entries, automatically handling pagination for you.
   * 
   * @param query The Contentful query/search parameters to use to fetch entries. See: https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/search-parameters
   * @param options.locale The locale to fetch. Uses the space default if undefined.
   * @param options.mode What mode to run the request in ("delivery", "preview", or "management")
   */
  public async getEntries<EntryShape extends any, Mode = unknown>(query?: any | null, options?: getEntriesOptions<"delivery">): Promise<DeliveryEntry<EntryShape>[]>
  public async getEntries<EntryShape extends any, Mode = "management">(query?: any | null, options?: getEntriesOptions<"management">): Promise<ManagementEntry[]>
  public async getEntries<EntryShape extends any, Mode extends "delivery" | "preview">(query?: any | null, options?: getEntriesOptions<Mode>): Promise<DeliveryEntry<EntryShape>[]>
  public async getEntries<EntryShape extends any, Mode extends ClientMode = "delivery">(query?: any | null, options?: getEntriesOptions<Mode>): Promise<DeliveryEntry<EntryShape>[] | ManagementEntry[]> {
    try {
      if (options?.mode === "management") {
        const { env } = await this.getManagementClient()
        const collection = await env.getEntries(query ?? {})
        const [entries, finalCollection] = await handleCollection<ManagementEntry>(query ?? {}, collection, [], async (query) => await env.getEntries(query))

        return entries
      }
      else {
        const preview = options?.mode === "preview" || options?.preview === true ? true : false
        const client = this.getDeliveryClient(preview)
        const collection = await client.getEntries<EntryShape>(query ?? {}) as unknown as ContentfulCollection<DeliveryEntry<EntryShape>>
        const [entries, finalCollection] = await handleCollection<DeliveryEntry<EntryShape>>(query ?? {}, collection, [], async (query) => {
          return await client.getEntries(query) as unknown as Promise<ContentfulCollection<DeliveryEntry<EntryShape>>>
        })

        return entries
      }
    }
    catch (error) {
      throw error
    }
  }

  /**
   * Creates a single entry
   * 
   * @param contentTypeId The content type id of the entry you are creating
   * @param fields The field data for the entry you are creating
   * @param options.locale The locale string for the locale to run the update for
   * @param options.references Whether or not nested references should be created/updated
   * @param options.entryId A pre-created entry ID to use instead of autogenerating one
   */
  public async createEntry<EntryShape = any>(contentTypeId: string, fields: EntryShape, options: {
    locale: string,
    entryId?: string,
    references?: boolean
  }) {
    const { locale } = options
    const contentType = await this.getContentType(contentTypeId)
    const { env } = await this.getManagementClient()
    const localizedFields = getLocalizedFields(fields, {
      contentType,
      locale: options.locale,
      references: false
    })
    const createdEntry = typeof options.entryId === "string" 
      ? await env.createEntryWithId(contentTypeId, options.entryId, { fields: localizedFields })
      : await env.createEntry(contentTypeId, { fields: localizedFields })
  
    if (options?.references) {
      const entry = await this.getEntry(createdEntry.sys.id, { mode: "preview" })

      entry.fields = fields

      return await this.updateEntryRecursive(null, entry, { locale, contentType })
    }
    else {
      const localiedFieldsWithReferences = getLocalizedFields(fields, {
        contentType,
        locale: options.locale,
        references: true
      })

      createdEntry.fields = localiedFieldsWithReferences

      createdEntry.update()

      const entry = await this.getEntry(createdEntry.sys.id, { mode: "preview" })

      return entry
    }
  }

  /**
   * Updates a single entry
   * 
   * @param update The updated entry
   * @param options.locale The locale string for the locale to run the update for
   * @param options.initial The initial state of the entry, used for doing recursive updates to nested entries
   * @param options.force Whether or not to force updates even if versions mismatch
   */
  public async updateEntry<EntryShape extends Record<string, any> | unknown>(entryId: string, update: Entry<EntryShape>, options: {
    locale: string,
    initial?: Entry<EntryShape>,
    force?: boolean
  }) {
    try {
      const { locale } = options
      const entry = await this.getEntry<EntryShape>(entryId, {
        mode: "management"
      })
      const contentType = await this.getContentType(entry.sys.contentType.sys.id)

      if (options.force !== true && update?.sys?.revision && entry.sys.version !== update.sys.revision) {
        throw new Error(`This entry was already updated by ${entry.sys.updatedBy?.sys.id} at ${new Date(entry.sys.updatedAt).toLocaleDateString()}`)
      }

      if (options?.initial) {
        return this.updateEntryRecursive(options.initial, update, { locale, contentType })
      }
      else {
        const localizedFieldsWithReferences = getLocalizedFields(update.fields, { contentType, locale: options.locale, references: true })

        entry.fields = localizedFieldsWithReferences

        await entry.update()

        const updated_entry = await this.getEntry(entry.sys.id, { mode: "preview" })

        return updated_entry
      }
    }
    catch (error) {
      throw error
    }
  }

  /**
   * Updates an array of entries, resolving when all updates are complete
   * 
   * @param updates The updated entries
   * @param options.locale The locale string for the locale to run the update for
   * @param options.initial The initial state of the entries, used for doing recursive updates to nested entries
   * @param options.force Whether or not to force updates even if versions mismatch
   */
  public async updateEntries<EntryShape extends Record<string, any> | unknown>(updates: Entry<EntryShape>[], options: {
    locale: string,
    initial?: Entry<EntryShape>[],
    force?: boolean
  }) {
    return await Promise.all(updates.map(updated_entry => {
      const initial_entry = options?.initial && options?.initial?.find(entry => entry?.sys?.id === updated_entry?.sys?.id);

      if (initial_entry) {
        return this.updateEntryRecursive(initial_entry, updated_entry, { locale: options.locale })
      }

      if (!updated_entry?.sys?.id) {
        return this.createEntry(updated_entry?.sys?.contentType?.sys?.id, updated_entry.fields, options);
      }

      return this.updateEntry(updated_entry?.sys?.id, updated_entry, { locale: options.locale, force: options.force })
    }));
  }

  /** 
   * Recurses an entry and its references, comparing it against the initial, to compute a graph of operations
   * Then runs those operations in batches according to the rate limit.
   * 
   * It expects each nested entry to have a `sys` object with `contentType` defined, otherwise it's ignored.
   * 
   * It does not reverse partially failed transactions, instead tracking them and retrying them.
   */
  private async updateEntryRecursive(initial: Entry<unknown> | null = null, updated: Entry<unknown> | null = null, options: GraphOptions & { shouldDelete?: boolean, locale: string }) {
    try {
      const { create, update, dereference } = createContentfulOperationsForEntry(initial, updated, options)
      const createBatches = (items: any): Operation[][] => items.reduce((batches: Operation[][], item: any, i: number) => {
        const batchSize = this.rateLimit
        const batchNumber = i < batchSize ? 0 : Math.floor(i / batchSize)
        
        batches[batchNumber] = typeof batches[batchNumber] !== "undefined" ? batches[batchNumber] : []
        batches[batchNumber].push(item)
        
        return batches
      }, [])
      const runBatches = async (batches: Operation[][]) => {
        return await Promise.all(batches.map(
          async batch => await Promise.all(batch.map(
            async operation => {
              try {
                const locale = options.locale ?? operation.sys.locale

                switch (operation.type) {
                  case "create":
                    if (!operation.sys) throw new Error("A create operation was lacking a sys field");
                    return await this.createEntry(operation.sys.contentType?.sys.id, operation.fields, { locale, entryId: operation.sys.id })
                  case "update":
                    return await this.updateEntry(operation.sys.id, operation, { locale })
                  case "dereference":
                    if (!options.shouldDelete) break
                    return await this.deleteEntry(operation.sys.id)
                }
              } catch (error) {
                throw error
              }

              return null
            }
          )).then(batch => batch !== null)
        ))
      }
      const queues = {
        create: createBatches(create),
        update: createBatches(update),
        dereference: createBatches(dereference)
      }

      const create_results = await runBatches(queues.create)
      const update_results = await runBatches(queues.update)

      if (options.shouldDelete) {
        await runBatches(queues.dereference)
      }

      const updated_entry_id = updated?.sys?.id ?? initial?.sys?.id ?? null

      if (updated_entry_id === null) throw new Error("Missing entry id");

      const updated_entry = await this.getEntry(updated_entry_id, { mode: "preview" })
    
      return updated_entry
    } catch (error) {
      throw error
    }
  }

  /**
   * Publishes the latest version of the entry
   * 
   * @param entryId 
   */
  public async publishEntry(entryId: string) {
    try {
      const entry = await this.getEntry(entryId, { mode: "management" })

      await entry.publish()

      return true;
    }
    catch (error) {
      throw error
    }
  }

  /**
   * Unpublishes the latest version of the entry
   * 
   * @param entryId 
   */
  public async unpublishEntry(entryId: string) {
    try {
      const entry = await this.getEntry(entryId, { mode: "management" })

      await entry.unpublish();

      return true;
    }
    catch (error) {
      throw error
    }
  }

  /**
   * Archives an entry, hiding it from the delivery and preview APIs
   * 
   * @param entryId 
   */
  public async archiveEntry(entryId: string) {
    try {
      let entry = await this.getEntry(entryId, { mode: "management" })

      await entry.archive()

      return true;
    }
    catch (error) {
      throw error
    }
  }

  /**
   * Deletes an entry. This is irreversible.
   * 
   * @param entryId 
   */
  public async deleteEntry(entryId: string) {
    try {
      const entry = await this.getEntry(entryId, { mode: "management" })

      return await entry.delete()
    }
    catch (error) {
      throw error
    }
  }

  /**
   * Fetches a single asset
   * 
   * @param assetId The id of the asset to fetch
   * @param options.query The Contentful query/search parameters to use to fetch assets. See: https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/search-parameters
   * @param options.preview Fetches the latest draft asset version from the preview API instead of the published version from the delivery API
   */
  public async getAsset(assetId: string, options?: {
    query?: any,
    preview?: boolean
  }) {
    try {
      const client = this.getDeliveryClient(options?.preview ?? false)
      
      return await client.getAsset(assetId, options?.query ?? {})
    }
    catch (error) {
      throw error
    }
  }

  /**
   * Fetches an array of assets, automatically handling pagination for you.
   * 
   * @param query The Contentful query/search parameters to use to fetch assets. See: https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/search-parameters
   * @param options.preview Fetches the latest draft asset version from the preview API instead of the published version from the delivery API
   */
  public async getAssets(query?: any, options?: {
    preview?: boolean
  }) {
    try {
      const client = this.getDeliveryClient(options?.preview ?? false)
      const collection = await client.getAssets(query ?? {})
      const [assets, finalCollection] = await handleCollection(query ?? {}, collection, [], (query) => client.getAssets(query))

      return assets
    }
    catch (error) {
      throw error
    }
  }

  /**
   * Retreives a paginated collection of assets
   * 
   * @param query The Contentful query/search parameters to use to fetch assets. See: https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/search-parameters
   * @param options.preview Fetches the latest draft asset version from the preview API instead of the published version from the delivery API
   */
  public async getAssetCollection(query?: any, options?: {
    preview: boolean
  }) {
    try {
      const client = this.getDeliveryClient(options?.preview ?? false)

      return await client.getAssets(query ?? {})
    }
    catch (error) {
      throw error
    }
  }

  /**
   * Creates a new asset from a file upload, usually from the Media Manager
   * 
   * @param upload A valid contentful upload datastructure, including the contents of the file as a string, ArrayBuffer, or ReadStream
   * @param options.locale The locale string for the locale to run the create for
   */
  public async createAsset(upload: ContentfulUpload, options: { locale: string }) {
    try {
      const client = await this.getManagementClient()
      const { env } = client
      const localizedFields = getLocalizedFields(upload.fields, { locale: options.locale, references: false })
      const file = { fields: { ...upload.fields, ...localizedFields } }
      
      let asset = await env.createAssetFromFiles(file)
      asset = await asset.processForLocale(options.locale, { processingCheckRetries: 10 })
      asset = await asset.publish()
      
      return this.getAsset(asset.sys.id)
    }
    catch (error) {
      throw error
    }
  }

  /**
   * Updates an asset
   * 
   * @param assetId the ID of the asset to update_results
   * @param asset The updated asset
   * @param query The Contentful query/search parameters to use to when fetching the asset. See: https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/search-parameters
   * @param options.locale The locale string for the locale to run the create for
   */
  public async updateAsset(assetId: string, update: Asset, options: { query?: any, locale: string }) {
    try {
      const client = await this.getManagementClient()
      let asset = await client.env.getAsset(assetId, options?.query ?? {})
      const localizedFields = getLocalizedFields(update.fields, {
        locale: options.locale,
        references: false
      })
      const fields = { ...asset.fields, ...localizedFields }

      asset.fields = fields
      asset = await asset.update()
      asset = await asset.publish()

      return this.getAsset(asset.sys.id)
    }
    catch (error) {
      throw error
    }
  }

  /**
   * Archives the latest version of the asset
   * 
   * @param assetId The id of the asset to archive 
   */
  public async archiveAsset(assetId: string) {
    try {
      const client = await this.getManagementClient()
      let asset = await client.env.getAsset(assetId)

      if (asset.isPublished()) {
        await asset.unpublish()
      }

      await asset.archive()

      return true;
    }
    catch (error) {
      throw error
    }
  }

  /**
   * Deletes the the asset. This is irreverisble.
   * 
   * @param assetId The id of the asset to delete 
   */
  public async deleteAsset(assetId: string) {
    try {
      const client = await this.getManagementClient()
      let asset = await client.env.getAsset(assetId)

      if (asset.isPublished()) {
        await asset.unpublish()
      }

      await asset.delete()

      return true
    }
    catch (error) {
      throw error
    }
  }

  /**
   * Fetches a content type definition by ID
   * 
   * @param contentTypeId 
   * @param options.preview If true, get the latest unpublished revision
   * @returns 
   */
  public async getContentType<ContentTypeShape extends ContentType>(contentTypeId: string, options?: {
    preview?: boolean
  }) {
    const client = this.getDeliveryClient(options?.preview ?? false)

    return await client.getContentType(contentTypeId) as ContentTypeShape
  }

  private getDeliveryClient(preview: boolean) {
    return preview ? this.sdks.previewClient : this.sdks.deliveryClient
  }

  public async sync(query: any, options?: {
    preview: boolean
  }) {
    try {
      const client = this.getDeliveryClient(options?.preview ?? false)

      return await client.sync(query ?? {})
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
      const client: ClientAPI = this.sdks.managementClient
      const space = await client.getSpace(this.options.spaceId)
      const env = await space.getEnvironment(this.environment)
      
      return {
        client,
        space,
        env
      }
    }
    catch (error) {
      throw error
    }
  }
}
