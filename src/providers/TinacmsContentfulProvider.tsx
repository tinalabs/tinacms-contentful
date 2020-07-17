import React, { useState } from 'react';
import { ContentfulEditingProvider, ContentfulEditingProps } from './ContentfulEditingContextProvider';
import { ContentfulAuthModal } from '../components/modals/ContentfulAuthModal';

export interface TinaContentfulProviderProps {
  userAuth?: boolean,
  editing: {
    enabled: boolean;
    enterEditMode?: () => void;
    exitEditMode?: () => void;
  },
  children: any;
}

type Modals = "authenticate" | "none";

export const TinaContentfulProvider = ({
  userAuth = false,
  editing,
  children 
}: TinaContentfulProviderProps) => {
  const [activeModal, setActiveModal] = useState<Modals>("authenticate");
  const [currentAccessToken, setCurrentAccessToken] = useState<string>();
  const onClose = () => {
    setActiveModal("none");
  };
  const beginAuth = async () => {
    setActiveModal("authenticate");
  };
  const onAuthSuccess = async (accessToken: string) => {
    if (accessToken) setCurrentAccessToken(accessToken);
    if (editing.enterEditMode) editing.enterEditMode();
  };
  const onAuthFailure = async (message: string) => {
    console.error(message);
  }
  const editingProviderProps: ContentfulEditingProps = {
    userAccessToken: currentAccessToken ?? undefined,
    editing: {
      ...editing,
      enterEditMode: beginAuth
    }
  }

  return (
    <ContentfulEditingProvider
      value={editingProviderProps}
    >
      {activeModal === "authenticate" && userAuth && (
        <ContentfulAuthModal close={onClose} onAuthSuccess={onAuthSuccess} onAuthFailure={onAuthFailure} />
      )}
      {children}
    </ContentfulEditingProvider>
  );
};