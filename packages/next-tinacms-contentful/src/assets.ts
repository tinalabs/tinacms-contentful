import { ContentfulClient } from "react-tinacms-contentful"
import { ServerOptions } from "./entries";

export const getAsset = (assetId: string, options: Omit<ServerOptions, 'management'>): ReturnType<ContentfulClient['getAsset']> => {
  const client = new ContentfulClient(options);

  return client.getAsset(assetId, options);
}

export const getAssets = (query: any, options: Omit<ServerOptions, 'query' | 'management'>): ReturnType<ContentfulClient['getAssets']> => {
  const client = new ContentfulClient(options);

  return client.getAssets(query, options);
}