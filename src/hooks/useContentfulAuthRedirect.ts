import { ContentfulAuthenticationService } from '../services/contentful/authentication';

export function useContentfulAuthRedirect(): void {
  if (typeof window !== 'undefined') {
    ContentfulAuthenticationService.waitAndEmitAccessToken(window);
  }
}
