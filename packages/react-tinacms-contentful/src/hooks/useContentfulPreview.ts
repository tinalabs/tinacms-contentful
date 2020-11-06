import { ContentfulClientApi } from 'contentful';
import { useContentful } from './useContentful';

export function useContentfulPreview(spaceId?: string): ContentfulClientApi {
  const contentful = useContentful(spaceId);

  return contentful.sdks.previewClient;
}
