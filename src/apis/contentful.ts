import { createClient as createDeliveryClient, ContentfulClientApi } from 'contentful';
import { createClient as createManagementClient } from 'contentful-management';
import { ClientAPI } from 'contentful-management/dist/typings/create-contentful-api';
import { ContentfulAuthenticationService } from '../services/contentful/authentication';

export interface ContentfulClientOptions {
  clientId: string,
  spaceId: string;
  accessTokens: { 
    delivery: string;
    management: string
  },
  redirectUrl?: string;
  userAuth?: boolean;
  deliveryClient?: ContentfulClientApi,
  managementClient?: ClientAPI
}

export type ContentfulClient = {
  authenticate: Function;
} & {
  [key: string]: {
    delivery: ContentfulClientApi;
    management?: ClientAPI    
  }
}

export const ContentfulClient = function(this: ContentfulClient, options: ContentfulClientOptions) {
  this.authenticate = () => ContentfulAuthenticationService.Authenticate(options.clientId, options.redirectUrl ?? "/");
  this[options.spaceId] = {
    delivery: options.deliveryClient ?? createDeliveryClient({
      space: options.spaceId,
      accessToken: options.accessTokens.delivery,
      host: options.userAuth ? "preview.contentful.com" : undefined
    }),
    management: options.managementClient ?? (options.userAuth && options.accessTokens.management
      ? createManagementClient({
        accessToken: options.accessTokens.management
      }) 
      : undefined)
  }
} as any as { new (options: ContentfulClientOptions): ContentfulClient; }