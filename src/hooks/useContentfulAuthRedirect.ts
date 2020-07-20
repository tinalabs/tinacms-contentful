import { ContentfulAuthenticationService } from '../services/contentful/authentication';

export function useContentfulAuthRedirect(): void {
  if (typeof window !== 'undefined') {
    const userAccessToken = ContentfulAuthenticationService.GetAccessTokenFromWindow(window);

    if (!window.parent || !userAccessToken) {
      return;
    }
    
    const payload = {
      contentful: {
        userAccessToken: userAccessToken
      }
    }

    window.parent.postMessage(payload, "*");
  }
}