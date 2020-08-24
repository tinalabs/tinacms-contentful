
import {Entry, EntryCollection, Asset, AssetCollection, ContentfulClientApi} from "contentful";

export class ContentfulDeliveryService
{
  public static async GetMany<TEntryType>(client: ContentfulClientApi, query: any): Promise<Entry<TEntryType>[]> {
      return await this.handleEntryPaging(client, query);
  }

  public static async GetManyAssets(client: ContentfulClientApi, query: any): Promise<Asset[]> {
    return await this.handleAssetPaging(client, query);
  }

  private static async handleEntryPaging<TEntryType extends Entry<any>>(client: ContentfulClientApi, query: any, items: Entry<any>[] = [], currentCollection?: EntryCollection<Entry<any>>): Promise<TEntryType[]>
  {
    if (items.length === 0)
    {
      currentCollection = await client.getEntries<TEntryType>(query);

      items = currentCollection.items;
    }

    if (currentCollection && currentCollection.total < currentCollection.skip + currentCollection.limit)
    {
      const newQuery = {
        ...query,
        skip: currentCollection.limit + currentCollection.skip
      }

      return this.handleEntryPaging(client, newQuery, items, currentCollection);
    }

    return items as TEntryType[];
  }

  private static async handleAssetPaging<TAssetType extends Asset>(client: ContentfulClientApi, query: any, items: Asset[] = [], currentCollection?: AssetCollection): Promise<Asset[]> {
    if (items.length === 0)
    {
      currentCollection = await client.getAssets(query);

      items = currentCollection.items;
    }

    if (currentCollection && currentCollection.total < currentCollection.skip + currentCollection.limit)
    {
      const newQuery = {
        ...query,
        skip: currentCollection.limit + currentCollection.skip
      }

      return this.handleAssetPaging(client, newQuery, items, currentCollection);
    }

    return items as TAssetType[];
  }
}

export default ContentfulDeliveryService;