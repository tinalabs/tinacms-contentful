import { ContentfulClient } from "react-tinacms-contentful"
import { ServerOptions } from "./entries";

export const getAsset = (assetId: string, options: ServerOptions): ReturnType<ContentfulClient['getAsset']> => {
  const client = new ContentfulClient(options as any);

  return client.getAsset(assetId, options);
}

export const getAssets = (query: any, options: ServerOptions): ReturnType<ContentfulClient['getAssets']> => {
  const client = new ContentfulClient(options as any);

  return client.getAssets(query, options);
}