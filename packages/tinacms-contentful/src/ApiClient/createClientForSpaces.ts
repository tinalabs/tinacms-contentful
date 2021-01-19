import { ContentfulClientApi } from "contentful";
import { ClientAPI } from "contentful-management/dist/typings/create-contentful-api";
import { ContentfulClient, ContentfulClientOptions } from "./ApiClient";

export interface Space {
  id: string;
  defaultEnvironmentId: string;
  accessTokens: {
    delivery: string;
    preview: string;
  },
  deliveryClient?: ContentfulClientApi;
  previewClient?: ContentfulClientApi;
  managementClient?: ClientAPI;
}

export interface Options extends Omit<ContentfulClientOptions, "spaceId" | "defaultEnvironmentId" | "accessTokens">  { }

export type ContentfulMultiClient = Pick<ContentfulClient, "authenticate"> & {
  [key: string]: ContentfulClient;
}

export function createContentfulClientForSpaces(spaces: Space[], options: Options) {
  let client: any = {};
  
  spaces.forEach(space => {
    const hasAccessTokens = space.accessTokens.delivery && space.accessTokens.preview;
    const hasClients = typeof space?.deliveryClient !== "undefined" && typeof space?.previewClient !== "undefined";
    
    if (space.id && (hasAccessTokens || hasClients)) {
      const space_client = new ContentfulClient({
        ...options,
        defaultEnvironmentId: space.defaultEnvironmentId,
        spaceId: space.id,
        accessTokens: {
          delivery: space.accessTokens.delivery,
          preview: space.accessTokens.preview,
        },
        options: {
          deliveryClient: space.deliveryClient,
          previewClient: space.previewClient,
          managementClient: space.managementClient
        }
      });

      client[space.id] = space_client;

      if (!client.authenticate) {
        client.authenticate = space_client.authenticate.bind(space_client);
      }
    }
  }, {});

  return client as ContentfulMultiClient;
};
