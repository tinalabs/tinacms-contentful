import { ContentfulClient, getBearerToken } from 'tinacms-contentful';
import { useContentful } from './useContentful';

export function useContentfulAuthRedirect(): void {
  const contentful: ContentfulClient | Record<string, ContentfulClient> = useContentful();
  let allowedOrigins = contentful.allowedOrigins ?? [];

  if (typeof window !== 'undefined') {
    getBearerToken(window, allowedOrigins);
  }
}
