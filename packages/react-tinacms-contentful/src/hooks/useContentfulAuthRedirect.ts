import { ContentfulAuthenticationService } from 'tinacms-contentful';

export function useContentfulAuthRedirect(): void {
  if (typeof window !== 'undefined') {
    ContentfulAuthenticationService.waitAndEmitAccessToken(window);
  }
}
