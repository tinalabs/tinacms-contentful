import { ContentfulClientApi } from 'contentful';
import { ClientAPI } from 'contentful-management/dist/typings/create-contentful-api';
import { ContentfulAuthenticationService } from '../services/contentful/authentication';
import { ContentfulApiService } from '../services/contentful/apis';

export interface ContentfulClientOptions {
  clientId: string;
  spaceId: string;
  defaultEnvironmentId: string;
  accessTokens: {
    delivery: string;
    preview: string;
    management?: string;
  };
  redirectUrl: string;
  deliveryClient?: ContentfulClientApi;
  previewClient?: ContentfulClientApi;
  managementClient?: ClientAPI;
}

export type ContentfulClient = {
  authenticate: () => ReturnType<
    typeof ContentfulAuthenticationService.authenticate
  >;
} & {
  [spaceId: string]: ContentfulApiService;
};

export interface ContentfulClientConstructor {
  new (options: ContentfulClientOptions): ContentfulClient;
}

export const ContentfulClient = (function(
  this: ContentfulClient,
  options: ContentfulClientOptions
): ContentfulClient {
  this.authenticate = () =>
    ContentfulAuthenticationService.authenticate(
      options.clientId,
      options.redirectUrl
    );
  this[options.spaceId] = new ContentfulApiService(options);

  return this;
} as Function) as ContentfulClientConstructor;
