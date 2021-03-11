import { ContentfulClientApi } from 'contentful';
import { useContentful } from './useContentful';

export function useContentfulDelivery(spaceId?: string): ContentfulClientApi {
  const contentful = useContentful(spaceId);

  return contentful.sdks.deliveryClient;
}
