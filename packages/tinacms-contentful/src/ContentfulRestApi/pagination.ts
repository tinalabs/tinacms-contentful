import {
  Entry as DeliveryEntry,
  EntryCollection,
  Asset,
  AssetCollection,
  ContentfulClientApi,
} from 'contentful';
import { Entry as ManagementEntry } from 'contentful-management/dist/typings/entities/entry';
import { Environment } from 'contentful-management/dist/typings/entities/environment';

export class ContentfulPaginationService {
  public static async getMany<EntryShape, Client = ContentfulClientApi | Environment>(
    client: Client,
    query: any
  ) {
    const [entries] = await this.handleEntryPaging(client as any, query);

    return entries as Client extends Environment ? ManagementEntry[] : DeliveryEntry<EntryShape>[];
  }

  public static async getManyAssets(
    client: ContentfulClientApi | Environment,
    query: any
  ) {
    const [assets, remaining] = await this.handleAssetPaging(client as any, query);

    return {
      assets,
      remaining
    }
  }

  private static async handleEntryPaging<EntryShape extends any>(
    client: ContentfulClientApi,
    query: any,
    items: DeliveryEntry<any>[] = [],
    currentCollection?: EntryCollection<EntryShape>
  ): Promise<[unknown[], EntryCollection<EntryShape>]> {
    if (items.length === 0) {
      currentCollection = await client.getEntries<EntryShape>(query);

      items = currentCollection.items;
    }

    if (
      currentCollection &&
      currentCollection.total > currentCollection.skip + currentCollection.limit 
    ) {
      const newQuery = {
        ...query,
        skip: currentCollection.limit + currentCollection.skip,
      };

      return this.handleEntryPaging(client, newQuery, items, currentCollection);
    }

    return [items as EntryShape[], currentCollection as EntryCollection<EntryShape>];
  }

  private static async handleAssetPaging<TAssetType extends Asset>(
    client: ContentfulClientApi,
    query: any,
    items: Asset[] = [],
    currentCollection?: AssetCollection
  ): Promise<[Asset[], AssetCollection | undefined]> {
    if (items.length === 0) {
      currentCollection = await client.getAssets(query);

      items = currentCollection.items;
    }

    if (
      currentCollection &&
      currentCollection.total > currentCollection.skip + currentCollection.limit
    ) {
      const newQuery = {
        ...query,
        skip: currentCollection.limit + currentCollection.skip,
      };

      return this.handleAssetPaging(client, newQuery, items, currentCollection);
    }

    return [items as TAssetType[], currentCollection];
  }
}

export default ContentfulPaginationService;
