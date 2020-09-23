import { useContentful } from './useContentful';

export function useContentfulPreview(spaceId?: string) {
  const contentful = useContentful(spaceId);

  return contentful.sdks.previewClient;
}
