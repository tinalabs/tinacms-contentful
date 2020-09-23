import { Entry } from 'contentful';
export interface useContentfulEntryOptions {
    preview?: boolean;
    query?: any;
}
export declare function useContentfulEntry<TEntryType extends Entry<any>>(spaceId: string, entryId: string, opts?: useContentfulEntryOptions): [Entry<TEntryType> | undefined, boolean, Error | undefined];
