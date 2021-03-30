import React, { useState } from 'react';
import { TinaCMS, useCMS, useCMSEvent } from 'tinacms';
import { AUTH_FAILURE, AUTH_SUCCESS, ON_LOGIN, ON_LOGOUT } from 'tinacms-contentful';
import {
  ContentfulEditingProvider,
  ContentfulEditingProps,
} from './ContentfulEditingContextProvider';
import { ContentfulAuthModal } from '../authentication/modals/ContentfulAuthModal';
import { ContentfulErrorModal } from '../authentication/modals/ContentfulErrorModal';

export interface TinaContentfulProviderProps {
  onLogin?: () => Promise<void>;
  onLogout?: () => Promise<void>;
  children: any;
}

type Modals = 'authenticate' | 'error' | 'none';

/**
 * A provider for managing the Oauth authentication UI workflow for Contentful
 */
export const TinaContentfulProvider = ({
  onLogin,
  onLogout,
  children,
}: TinaContentfulProviderProps) => {
  const cms = useCMS();
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
  const onAuthSuccess = (_event: any) => {
    setActiveModal('none')

    if (onLogin) {
      onLogin()
        .then(() => cms.events.dispatch({ type: ON_LOGIN }))
    }
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
  useCMSEvent(AUTH_SUCCESS, onAuthSuccess, []);
  useCMSEvent(AUTH_FAILURE, onAuthFailure, []);
  useCMSEvent(TinaCMS.DISABLED.type, () => {
    if (onLogout) {
      onLogout()
        .then(() => cms.events.dispatch({ type: ON_LOGOUT }))
    }
  }, []);

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