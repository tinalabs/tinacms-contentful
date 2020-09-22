import { useState, useContext } from 'react';
import { ContentfulAuthenticationService } from '../services/contentful/authentication';
import { ContentfulEditingContext } from '../state/ContentfulEditingContextProvider';

export function useContentfulUserAuthToken(): [string | undefined] {
  const context = useContext(ContentfulEditingContext);
  const [userAccessToken, setUserAccessToken] = useState<string>();
  const cachedToken = ContentfulAuthenticationService.getCachedAccessToken();

  // Use token from context if available
  if (context?.userAccessToken) {
    setUserAccessToken(context.userAccessToken);
  }
  // Else try using fallback
  else if (cachedToken) {
    setUserAccessToken(context?.userAccessToken);
  }

  return [userAccessToken];
}
