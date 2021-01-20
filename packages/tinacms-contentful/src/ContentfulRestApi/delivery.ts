import {
  Entry,
  EntryCollection,
  Asset,
  AssetCollection,
  ContentfulClientApi,
} from 'contentful';

export class ContentfulDeliveryService {
  public static async getMany<TEntryType>(
    client: ContentfulClientApi,
    query: any
  ): Promise<Entry<TEntryType>[]> {
    const [entries, remaining] = await this.handleEntryPaging(client, query);

    return entries;
  }

  public static async getManyAssets(
    client: ContentfulClientApi,
    query: any
  ) {
    const [assets, remaining] = await this.handleAssetPaging(client, query);

    return {
      assets,
      remaining
    }
  }

  private static async handleEntryPaging<TEntryType extends Entry<any>>(
    client: ContentfulClientApi,
    query: any,
    items: Entry<any>[] = [],
    currentCollection?: EntryCollection<TEntryType>
  ): Promise<[TEntryType[], EntryCollection<TEntryType>]> {
    if (items.length === 0) {
      currentCollection = await client.getEntries<TEntryType>(query);

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

    return [items as TEntryType[], currentCollection as EntryCollection<TEntryType>];
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
      currentCollection.total < currentCollection.skip + currentCollection.limit
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

export default ContentfulDeliveryService;
