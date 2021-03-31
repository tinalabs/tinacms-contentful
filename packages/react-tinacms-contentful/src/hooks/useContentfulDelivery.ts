import { ContentfulClientApi } from 'contentful';
import { useContentful } from './useContentful';

/**
 * Retrieves the Contentful Delivery SDK from the CMS
 * 
 * @param spaceId When using multiple spaces, specify the space you need the client for (Optional)
 * @returns 
 */
export function useContentfulDelivery(spaceId?: string): ContentfulClientApi {
  const contentful = useContentful(spaceId);

  return contentful.sdks.deliveryClient;
}
