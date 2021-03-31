import { ContentfulClient, ContentfulMediaStore as BaseContentfulMediaStore, ContentfulMediaStoreOptions } from "tinacms-contentful";

export interface ContentfulReactMediaStoreOptions extends ContentfulMediaStoreOptions {
  filter?: boolean;
  archive?: boolean;
}

/**
 * @deprecated Please us ethe ContentfulMediaStore class instead
 */
export class ContentfulReactMediaStore extends BaseContentfulMediaStore {
  constructor(ContentfulClient: ContentfulClient, options: ContentfulReactMediaStoreOptions) {
    super(ContentfulClient, options);
  }
}