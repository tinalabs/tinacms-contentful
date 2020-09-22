import React, { useEffect, useState } from 'react';
import { TinaCMS, useCMS, useCMSEvent } from 'tinacms';
import { ContentfulEditingProvider, ContentfulEditingProps } from '../state/ContentfulEditingContextProvider';
import { ContentfulAuthModal } from '../components/modals/ContentfulAuthModal';
import { ContentfulErrorModal } from '../components/modals/ContentfulErrorModal';
import { ContentfulAuthenticationService } from '../services/contentful/authentication';

export interface TinaContentfulProviderProps {
  onLogin?: () => void;
  onLogout?: () => void;
  enabled: boolean;
  children: any;
}

type Modals = "authenticate" | "error" | "none";

export const TinaContentfulProvider = ({
  enabled,
  onLogin,
  onLogout,
  children 
}: TinaContentfulProviderProps) => {
  const [activeModal, setActiveModal] = useState<Modals>("none");
  const [userAccessToken, setUserAccessToken] = useState<string | undefined>(ContentfulAuthenticationService.getCachedAccessToken());
  const [currentError, setCurrentError] = useState<Error>();
  const onClose = () => {
    setActiveModal("none");
    setCurrentError(undefined);
  };
  const onRetry = () => {
    setActiveModal("authenticate");
    setCurrentError(undefined);
  }
  const onAuthSuccess = (userAccessToken: string) => {
    if (onLogin) onLogin();
    setUserAccessToken(userAccessToken);
    setActiveModal("none");
    ContentfulAuthenticationService.setCachedAccessToken(userAccessToken);
  };
  const onAuthFailure = (error: Error) => {
    setCurrentError(error);
    setActiveModal("error");
  }
  const beginAuth = () => {
    setActiveModal("authenticate");
  }
  const editingProviderProps: ContentfulEditingProps = {
    userAccessToken: userAccessToken,
    onLogin,
    onLogout,
    enabled
  }

  useCMSEvent(TinaCMS.ENABLED.type, beginAuth, [])
  useCMSEvent(TinaCMS.DISABLED.type, onLogout, []);

  return (
    <ContentfulEditingProvider
      value={editingProviderProps}
    >
      {activeModal === "authenticate" && (
        <ContentfulAuthModal onClose={onClose} onAuthSuccess={onAuthSuccess} onAuthFailure={onAuthFailure} />
      )}
      {activeModal === "error" && currentError && (
        <ContentfulErrorModal onClose={onClose} onRetry={onRetry} error={currentError} />
      )}
      {children}
    </ContentfulEditingProvider>
  );
};

function useCMSEvent(event: string, callback: any, deps: React.DependencyList) {
  const cms = useCMS();
  
  useEffect(function() {
    return cms.events.subscribe(event, callback)
  }, deps)
}