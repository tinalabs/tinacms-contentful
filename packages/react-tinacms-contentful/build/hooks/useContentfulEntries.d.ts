import { Entry } from 'contentful';
export interface useContentfulEntriesOptions {
    preview?: boolean;
}
export declare function useContentfulEntries<TEntryType = any>(spaceId: string, query: any, opts?: useContentfulEntriesOptions): [Entry<TEntryType>[], boolean, Error | undefined];
