import { Entry as DeliveryEntry } from 'contentful';
import { Entry as ManagementEntry } from 'contentful-management/dist/typings/entities/entry';
import { ClientMode, ContentfulClient, ContentfulClientOptions, SpaceOptions, getEntryOptions } from "tinacms-contentful";

export type BaseServerOptions<Mode extends ClientMode> = getEntryOptions<Mode>;

export type ServerOptions<Mode extends ClientMode = any> = BaseServerOptions<Mode> & Omit<ContentfulClientOptions, 'clientId' | 'redirectUrl'> & SpaceOptions

class ServerSideEntries {
  public static async getEntry<EntryShape extends any, Mode extends ClientMode>(entryId: string, options: ServerOptions<Mode>): Promise<DeliveryEntry<EntryShape>>
  public static async getEntry<EntryShape extends any, Mode extends ClientMode = "delivery" | "preview">(entryId: string, options: ServerOptions<Mode>): Promise<DeliveryEntry<EntryShape>>
  public static async getEntry<EntryShape extends any, Mode extends ClientMode = "management">(entryId: string, options: ServerOptions<Mode>): Promise<ManagementEntry>
  public static async getEntry<EntryShape extends any, Mode extends ClientMode>(entryId: string, options: ServerOptions<Mode>): Promise<DeliveryEntry<EntryShape> | ManagementEntry> {
    const client = new ContentfulClient(options as any);

    return client.getEntry(entryId, options);
  }

  public static async getEntries<EntryShape extends any, Mode extends ClientMode>(query: any, options: Omit<ServerOptions<Mode>, 'query'>): Promise<DeliveryEntry<EntryShape>[]>
  public static async getEntries<EntryShape extends any, Mode extends ClientMode = "delivery" | "preview">(query: any, options: Omit<ServerOptions<Mode>, 'query'>): Promise<DeliveryEntry<EntryShape>[]>
  public static async getEntries<EntryShape extends any, Mode extends ClientMode = "management">(query: any, options: Omit<ServerOptions<Mode>, 'query'>): Promise<ManagementEntry[]>
  public static async getEntries<EntryShape extends any, Mode extends ClientMode>(query: any, options: Omit<ServerOptions<Mode>, 'query'>): Promise<DeliveryEntry<EntryShape>[] | ManagementEntry[]> {
    const client = new ContentfulClient(options as any);

    return client.getEntries<EntryShape, Mode>(query, options);
  }
}

export const getEntry = ServerSideEntries.getEntry

export const getEntries = ServerSideEntries.getEntries