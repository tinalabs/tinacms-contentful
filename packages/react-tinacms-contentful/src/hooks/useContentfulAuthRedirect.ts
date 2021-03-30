import { ContentfulClient, getBearerToken } from 'tinacms-contentful';
import { useContentful } from './useContentful';

/**
 * Retreives the OAuth Bearer Token from the page used as the OAuth App's callback URL
 */
export function useContentfulAuthRedirect(): void {
  const contentful: ContentfulClient | Record<string, ContentfulClient> = useContentful();
  let allowedOrigins = contentful.allowedOrigins ?? [];

  if (typeof window !== 'undefined') {
    getBearerToken(window, allowedOrigins);
  }
}
