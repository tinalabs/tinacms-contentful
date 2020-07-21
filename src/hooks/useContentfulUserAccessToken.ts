import { useState, useContext } from 'react';
import { ContentfulEditingContext } from '../providers/ContentfulEditingContextProvider';

export function useContentfulUserAuthToken(): [string | undefined] {
  const context = useContext(ContentfulEditingContext);
  const [userAccessToken, setUserAccessToken] = useState<string>();

  // Use token from context if available
  if (context?.userAccessToken) {
    setUserAccessToken(context.userAccessToken);
  }
  
  // Listen for token from postmessage
  if (typeof window !== 'undefined') {
    window.addEventListener('message', event => {
      if (event.data.contentful.userAccessToken)
      {
        setUserAccessToken(event.data.contentful.userAccessToken);
      }
    });
  }

  return [userAccessToken];
}