import { FormOptions, Form } from 'tinacms';
import { AnyField, Field } from '@tinacms/forms';
import { Entry, ContentType } from 'contentful';
export interface ContentfulEntryFormOptions extends Partial<FormOptions<any>> {
    name?: string;
    query?: any;
    contentType?: ContentType;
    contentTypeId?: string;
    environmentId?: string;
    fields?: Field<AnyField>[];
    preview?: boolean;
}
export declare function useContentfulEntryForm<TEntryType extends any>(spaceId: string, entryId: string, options: ContentfulEntryFormOptions): [Entry<TEntryType>, Form];
