import {
  ContentfulCollection,
} from 'contentful';

/**
 * Completely resolves a Contentful collection to an array of items
 * 
 * @param query The query to fetch the collection
 * @param collection The current collection
 * @param items The current array of items
 * @param getNextPage The logic to fetch the next page
 * @returns An array of items
 */
export async function handleCollection<CollectionEntity = unknown>(
  query: any, collection: ContentfulCollection<CollectionEntity>, items: CollectionEntity[], getNextPage: (query: any) => Promise<ContentfulCollection<CollectionEntity>>
): Promise<[CollectionEntity[], ContentfulCollection<CollectionEntity>]> {
  const offset = collection.skip + collection.limit;

  items.push(...collection.items);

  if (offset < collection.total) {
    const nextCollection = await getNextPage({
      ...query,
      limit: collection.limit,
      skip: offset,
    })

    return handleCollection(query, nextCollection, items, getNextPage);
  }

  return [items, collection];
}