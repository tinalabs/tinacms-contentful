import React from 'react';
import { ContentfulEditingContext } from './ContentfulEditingContext';
import { useState } from 'react';
import { ContentfulAuthModel } from '../components/modals';

interface ProviderProps {
  children: any;
  editMode: boolean;
  enterEditMode: () => void;
  exitEditMode: () => void;
}

export const TinaContentfulProvider = ({
  children,
  editMode,
  enterEditMode,
  exitEditMode,
}: ProviderProps) => {
  type ModalNames = null | 'authenticate';
  const [activeModal, setActiveModal] = useState<ModalNames>(null);

  const onClose = () => {
    setActiveModal(null);
  };
  const beginAuth = async () => {
    setActiveModal('authenticate');
  };
  const onAuthSuccess = async () => {
    enterEditMode();
  };

  return (
    <ContentfulEditingContext.Provider
      value={{ editMode, enterEditMode: beginAuth, exitEditMode }}
    >
      {activeModal === 'authenticate' && (
        <ContentfulAuthModel close={onClose} onAuthSuccess={onAuthSuccess} />
      )}
      {children}
    </ContentfulEditingContext.Provider>
  );
};
