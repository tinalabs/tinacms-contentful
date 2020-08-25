import { ContentfulAuthenticationService } from '../services/contentful/authentication';

export function useContentfulAuthRedirect(): void {
  if (typeof window !== 'undefined') {
    const userAccessToken = ContentfulAuthenticationService.getAccessTokenFromWindow(window);

    if (!window.opener || !userAccessToken) {
      return;
    }
    
    const payload = {
      contentful: {
        userAccessToken: userAccessToken
      }
    }

    // Send token via postmessage
    // TODO: fix domain scoping
    window.opener.postMessage(payload, "*");
  }
}