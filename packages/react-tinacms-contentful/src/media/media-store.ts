import { ContentfulClient, ContentfulMediaStore as BaseContentfulMediaStore, ContentfulMediaStoreOptions } from "tinacms-contentful";
import { MediaArchiveAction } from "./actions/archive";
import { MediaFilterAction } from "./actions/media-filter";

export interface ContentfulReactMediaStoreOptions extends ContentfulMediaStoreOptions {
  filter?: boolean;
  archive?: boolean;
}

export class ContentfulReactMediaStore extends BaseContentfulMediaStore {
  constructor(ContentfulClient: ContentfulClient, options: ContentfulReactMediaStoreOptions) {
    super(ContentfulClient, options);

    this.actions = [
      ...this.actions,
    ]

    if (options.filter !== false) {
      this.actions.push(MediaFilterAction)
    }

    if (options.archive !== false) {
      this.actions.push(MediaArchiveAction)
    }

    if (options?.actions && options?.actions?.length > 0) {
      this.actions = [
        ...this.actions,
        ...options.actions
      ]
    }
  }

  actions: any[] = [];  
}