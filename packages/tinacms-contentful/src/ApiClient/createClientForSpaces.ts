import { ContentfulClient, ContentfulClientOptions } from "./ApiClient";

export interface Space {
  id: string;
  defaultEnvironmentId: string;
  accessTokens: {
    delivery: string;
    preview: string;
  }
}

export interface Options extends Omit<ContentfulClientOptions, "spaceId" | "defaultEnvironmentId" | "accessTokens">  { }

export type ContentfulMultiClient = Pick<ContentfulClient, "authenticate"> & {
  [key: string]: ContentfulClient;
}

export function createContentfulClientForSpaces(spaces: Space[], options: Options) {
  let client: any = {};
  
  spaces.forEach(space => {
    if (space.id && space.accessTokens.delivery && space.accessTokens.preview) {
      const space_client = new ContentfulClient({
        ...options,
        defaultEnvironmentId: space.defaultEnvironmentId,
        spaceId: space.id,
        accessTokens: {
          delivery: space.accessTokens.delivery,
          preview: space.accessTokens.preview,
        },
      });

      client[space.id] = space_client;

      if (!client.authenticate) {
        client.authenticate = space_client.authenticate.bind(space_client);
      }
    }
  }, {});

  return client as ContentfulMultiClient;
};