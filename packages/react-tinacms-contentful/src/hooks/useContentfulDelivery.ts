import { useContentful } from './useContentful';

export function useContentfulDelivery(spaceId?: string) {
  const contentful = useContentful(spaceId);

  return contentful.sdks.deliveryClient;
}
