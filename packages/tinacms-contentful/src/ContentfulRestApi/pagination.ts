import {
  ContentfulCollection,
} from 'contentful';

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
