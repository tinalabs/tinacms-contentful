import { Entry as DeliveryEntry } from 'contentful';
import { Entry as ManagementEntry } from 'contentful-management/dist/typings/entities/entry';
import { ClientMode, ContentfulClient, ContentfulClientOptions, SpaceOptions, getEntryOptions, getEntriesOptions } from "tinacms-contentful";

export type ServerOptions<BaseOptions = any> = BaseOptions & Omit<ContentfulClientOptions, 'clientId' | 'redirectUrl'> & SpaceOptions
export type getServerSideEntryOptions<Mode extends ClientMode = "delivery"> = ServerOptions<getEntryOptions<Mode>>
export type getServerSideEntriesOptions<Mode extends ClientMode = "delivery"> = ServerOptions<getEntriesOptions<Mode>> 

class ServerSideEntries {
  public static async getEntry<EntryShape extends any, Mode = unknown>(entryId: string, options: getServerSideEntryOptions<"delivery">): Promise<DeliveryEntry<EntryShape>>
  public static async getEntry<EntryShape extends any, Mode = "management">(entryId: string, options: getServerSideEntryOptions<"management">): Promise<ManagementEntry>
  public static async getEntry<EntryShape extends any, Mode extends "delivery" | "preview">(entryId: string, options: getServerSideEntryOptions<Mode>): Promise<DeliveryEntry<EntryShape>>
  public static async getEntry<EntryShape extends any, Mode extends ClientMode = "delivery">(entryId: string, options: getServerSideEntryOptions<Mode>): Promise<DeliveryEntry<EntryShape> | ManagementEntry> {
    const client = new ContentfulClient(options as any);

    // todo: fix options type
    return client.getEntry<EntryShape, Mode>(entryId, options as any);
  }

  public static async getEntries<EntryShape extends any, Mode = unknown>(query?: any, options?: Omit<getServerSideEntriesOptions<"delivery">, 'query'>): Promise<DeliveryEntry<EntryShape>[]>
  public static async getEntries<EntryShape extends any, Mode = "management">(query?: any, options?: Omit<getServerSideEntriesOptions<"management">, 'query'>): Promise<ManagementEntry[]>
  public static async getEntries<EntryShape extends any, Mode extends "delivery" | "preview">(query?: any, options?: Omit<getServerSideEntriesOptions<Mode>, 'query'>): Promise<DeliveryEntry<EntryShape>[]>
  public static async getEntries<EntryShape extends any, Mode extends ClientMode = "delivery">(query?: any, options?: Omit<getServerSideEntriesOptions<Mode>, 'query'>): Promise<DeliveryEntry<EntryShape>[] | ManagementEntry[]> {
    const client = new ContentfulClient(options as any);

    // todo: fix options type
    return client.getEntries<EntryShape, Mode>(query, options as any);
  }
}

export const getEntry = ServerSideEntries.getEntry

export const getEntries = ServerSideEntries.getEntries