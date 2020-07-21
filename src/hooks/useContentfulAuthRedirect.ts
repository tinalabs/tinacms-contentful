import { ContentfulAuthenticationService } from '../services/contentful/authentication';

export function useContentfulAuthRedirect(): void {
  if (typeof window !== 'undefined') {
    const userAccessToken = ContentfulAuthenticationService.GetAccessTokenFromWindow(window);

    if (!window.opener || !userAccessToken) {
      return;
    }
    
    const payload = {
      contentful: {
        userAccessToken: userAccessToken
      }
    }

    // Send token via postmessage
    window.opener.postMessage(payload, "*");
  }
}