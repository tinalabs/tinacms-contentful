import { Entry as DeliveryEntry } from 'contentful';
import { Entry } from 'contentful-management/dist/typings/entities/entry';
import { ContentfulClient, ContentfulClientOptions } from "react-tinacms-contentful"

export type BaseServerOptions<Management extends boolean = false> = {
  preview?: Management extends true ? false | undefined : boolean;
  management?: Management extends false ? false | undefined : boolean;
}

export type ServerOptions = BaseServerOptions & ContentfulClientOptions & {
  locale: string
  query?: any,
};

export const getEntry = <EntryShape extends any, Management extends boolean = false>(entryId: string, options: ServerOptions) => {
  const client = new ContentfulClient(options);

  return client.getEntry<EntryShape, Management>(entryId, {
    query: options.query,
    preview: options.preview as any,
    management: options.management as any
  }) as Promise<Management extends true ? Entry : DeliveryEntry<EntryShape>>
}

export const getEntries = <EntryShape extends any, Management extends boolean = false>(query: any, options: Omit<ServerOptions, 'query'>): ReturnType<ContentfulClient['getEntries']> => {
  const client = new ContentfulClient(options);

  return client.getEntries<EntryShape, Management>(query, {
    preview: options.preview as any,
    management: options.management as any
  }) as Promise<Management extends true ? Entry[] : DeliveryEntry<EntryShape>[]>
}