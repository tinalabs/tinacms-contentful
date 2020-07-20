import React, { useState } from 'react';
import { ContentfulEditingProvider, ContentfulEditingProps } from './ContentfulEditingContextProvider';
import { ContentfulAuthModal } from '../components/modals/ContentfulAuthModal';
import { useContentfulUserAuthToken } from '../hooks/useContentfulUserAccessToken';

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
  const [userAccessToken] = useContentfulUserAuthToken();
  const onClose = () => {
    setActiveModal("none");
  };
  const beginAuth = async () => {
    setActiveModal("authenticate");
  };
  const onAuthSuccess = async () => {
    if (editing.enterEditMode) editing.enterEditMode();
  };
  const onAuthFailure = async (message: string) => {
    console.error(message);
    setActiveModal("none");
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
      {activeModal === "authenticate" && userAuth && (
        <ContentfulAuthModal close={onClose} onAuthSuccess={onAuthSuccess} onAuthFailure={onAuthFailure} />
      )}
      {children}
    </ContentfulEditingProvider>
  );
};