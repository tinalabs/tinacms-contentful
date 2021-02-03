import React, { useEffect, useState } from 'react';
import { TinaCMS, useCMS } from 'tinacms';
import {
  ContentfulEditingProvider,
  ContentfulEditingProps,
} from './ContentfulEditingContextProvider';
import { AUTH_FAILURE, AUTH_SUCCESS } from 'tinacms-contentful';
import { ContentfulAuthModal } from '../components/modals/ContentfulAuthModal';
import { ContentfulErrorModal } from '../components/modals/ContentfulErrorModal';

export interface TinaContentfulProviderProps {
  onLogin?: () => void;
  onLogout?: () => void;
  children: any;
}

type Modals = 'authenticate' | 'error' | 'none';

export const TinaContentfulProvider = ({
  onLogin,
  onLogout,
  children,
}: TinaContentfulProviderProps) => {
  const [activeModal, setActiveModal] = useState<Modals>('none');
  const [currentError, setCurrentError] = useState<Error>();
  const onClose = () => {
    if (onLogout) onLogout();
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
  };
  const onAuthFailure = (event: any) => {
    if (event.error) setCurrentError(event.error);
    setActiveModal('error');
  };
  const beginAuth = () => {
    setActiveModal('authenticate');
  };
  const editingProviderProps: ContentfulEditingProps = {
    onLogin,
    onLogout
  };

  useCMSEvent(TinaCMS.ENABLED.type, beginAuth, []);
  useCMSEvent(TinaCMS.DISABLED.type, onLogout, []);
  useCMSEvent(AUTH_SUCCESS, onAuthSuccess, []);
  useCMSEvent(AUTH_FAILURE, onAuthFailure, []);

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
