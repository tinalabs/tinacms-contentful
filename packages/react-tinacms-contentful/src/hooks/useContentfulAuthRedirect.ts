import { getAccessToken } from 'tinacms-contentful';
import { useContentful } from './useContentful';

export function useContentfulAuthRedirect(): void {
  const { allowedHostName } = useContentful();

  if (typeof window !== 'undefined') {
    getAccessToken(window, allowedHostName);
  }
}
