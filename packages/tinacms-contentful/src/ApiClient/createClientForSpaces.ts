import { openOauthWindow } from "../Authentication";
import { SpaceOptions, ContentfulClient, ContentfulClientOptions } from "./ApiClient";

export type ContentfulMultiClient = Pick<ContentfulClient, "authenticate" | "allowedOrigins"> & {
  [key: string]: ContentfulClient;
}

export function createContentfulClientForSpaces(spaces: SpaceOptions[], options: ContentfulClientOptions) {
  let client: ContentfulMultiClient;

  client = {} as any;
  
  spaces.forEach(space => {
    const hasAccessTokens = space.accessTokens.delivery && space.accessTokens.preview;
    const hasClients = typeof space?.options?.deliveryClient !== "undefined" && typeof space?.options?.previewClient !== "undefined";
    
    if (space.spaceId && (hasAccessTokens || hasClients)) {
      const space_client = new ContentfulClient({
        ...options,
        defaultEnvironmentId: space.defaultEnvironmentId,
        spaceId: space.spaceId,
        accessTokens: {
          delivery: space.accessTokens.delivery,
          preview: space.accessTokens.preview,
        },
        options: space.options
      });

      client[space.spaceId] = space_client;
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
