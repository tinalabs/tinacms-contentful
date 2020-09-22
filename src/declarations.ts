import { TinaCMS as CMSBase } from 'tinacms';
import { ContentfulClient } from './apis/contentful';

export declare class TinaCMS extends CMSBase {
  api: {
    [key: string]: any;
    contentful: ContentfulClient;
  };
}
