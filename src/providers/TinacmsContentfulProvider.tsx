import React, { useState } from 'react';
import { ContentfulEditingProvider, ContentfulEditingProps } from './ContentfulEditingContextProvider';
import { ContentfulAuthModal } from '../components/modals/ContentfulAuthModal';
import { ContentfulErrorModal } from '../components/modals/ContentfulErrorModal';
import { ContentfulAuthenticationService } from '../services/contentful/authentication';

export interface TinaContentfulProviderProps {
  editing: {
    enabled: boolean;
    enterEditMode?: () => void;
    exitEditMode?: () => void;
  },
  children: any;
}

type Modals = "authenticate" | "error" | "none";

export const TinaContentfulProvider = ({
  editing,
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
  const beginAuth = () => {
    setActiveModal("authenticate");
  };
  const onAuthSuccess = (userAccessToken: string) => {
    if (editing.enterEditMode) editing.enterEditMode();
    setUserAccessToken(userAccessToken);
    setActiveModal("none");
    ContentfulAuthenticationService.setCachedAccessToken(userAccessToken);
  };
  const onAuthFailure = (error: Error) => {
    setCurrentError(error);
    setActiveModal("error");
  }
  const editingProviderProps: ContentfulEditingProps = {
    userAccessToken: userAccessToken,
    editing: {
      ...editing,
      enterEditMode: beginAuth
    }
  }

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