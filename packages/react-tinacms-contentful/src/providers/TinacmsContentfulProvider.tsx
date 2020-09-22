import React, { useEffect, useState } from 'react';
import { TinaCMS, useCMS } from 'tinacms';
import {
  ContentfulEditingProvider,
  ContentfulEditingProps,
} from '../state/ContentfulEditingContextProvider';
import { AUTH_FAILURE, AUTH_SUCCESS } from 'tinacms-contentful';
import { ContentfulAuthModal } from '../components/modals/ContentfulAuthModal';
import { ContentfulErrorModal } from '../components/modals/ContentfulErrorModal';

export interface TinaContentfulProviderProps {
  onLogin?: () => void;
  onLogout?: () => void;
  enabled: boolean;
  children: any;
}

type Modals = 'authenticate' | 'error' | 'none';

export const TinaContentfulProvider = ({
  enabled,
  onLogin,
  onLogout,
  children,
}: TinaContentfulProviderProps) => {
  const cms = useCMS();
  const [activeModal, setActiveModal] = useState<Modals>('none');
  // TODO: investigate caching
  const [userAccessToken, setUserAccessToken] = useState<string | undefined>();
  const [currentError, setCurrentError] = useState<Error>();
  const onClose = () => {
    setActiveModal('none');
    setCurrentError(undefined);
  };
  const onRetry = () => {
    setActiveModal('authenticate');
    setCurrentError(undefined);
  };
  const onAuthSuccess = (userAccessToken: string) => {
    if (onLogin) onLogin();
    setActiveModal('none');
    setUserAccessToken(userAccessToken);
  };
  const onAuthFailure = (error: Error) => {
    setCurrentError(error);
    setActiveModal('error');
  };
  const beginAuth = () => {
    setActiveModal('authenticate');
  };
  const editingProviderProps: ContentfulEditingProps = {
    userAccessToken: userAccessToken,
    onLogin,
    onLogout,
    enabled,
  };

  useCMSEvent(TinaCMS.ENABLED.type, beginAuth, []);
  useCMSEvent(TinaCMS.DISABLED.type, onLogout, []);
  useCMSEvent(AUTH_FAILURE, onAuthFailure, []);
  useCMSEvent(AUTH_SUCCESS, onAuthSuccess, []);

  return (
    <ContentfulEditingProvider value={editingProviderProps}>
      {activeModal === 'authenticate' && (
        <ContentfulAuthModal onClose={onClose} />
      )}
      {activeModal === 'error' && currentError && (
        <ContentfulErrorModal
          onClose={onClose}
          onRetry={onRetry}
          error={currentError}
        />
      )}
      {children}
    </ContentfulEditingProvider>
  );
};

export function useCMSEvent(
  event: string,
  callback: any,
  deps: React.DependencyList
) {
  const cms = useCMS();

  useEffect(function() {
    return cms.events.subscribe(event, callback);
  }, deps);
}
