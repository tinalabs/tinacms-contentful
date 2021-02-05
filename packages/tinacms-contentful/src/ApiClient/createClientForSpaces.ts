import { ContentfulClientApi } from "contentful";
import { openOauthWindow } from "../Authentication";
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

export type ContentfulMultiClient = Pick<ContentfulClient, "authenticate" | "allowedOrigins"> & {
  [key: string]: ContentfulClient;
}

export function createContentfulClientForSpaces(spaces: Space[], options: Options) {
  let client: ContentfulMultiClient;

  client = {} as any;
  
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
    }
  }, {});

  if (!client.authenticate) {
    const spaces = Object.keys(client)
      .map(key => client[key] as ContentfulClient);
    
    client.allowedOrigins = spaces.find(item => typeof item.allowedOrigins !== "undefined")?.allowedOrigins ?? [];
    client.authenticate = async (popup?: Window) => {
      const auth_window = popup ?? openOauthWindow(options.clientId, options.redirectUrl);
      const res = await Promise.all(spaces.map(space => space?.authenticate(auth_window)));

      return res.filter(item => item === false).length === 0;
    }
  }

  return client as ContentfulMultiClient;
};
