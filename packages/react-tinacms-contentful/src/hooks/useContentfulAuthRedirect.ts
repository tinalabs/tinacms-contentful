import { getAccessToken } from 'tinacms-contentful';

export function useContentfulAuthRedirect(): void {
  if (typeof window !== 'undefined') {
    getAccessToken(window);
  }
}
