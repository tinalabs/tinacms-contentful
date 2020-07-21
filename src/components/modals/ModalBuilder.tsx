import React from 'react';
import styled from 'styled-components';
import { TinaReset } from '@tinacms/styles';
import { Modal, ModalPopup, ModalHeader, ModalBody, ModalActions } from 'tinacms';
import { AsyncButton } from '../button/async';

// TODO: This is copy-pasted directly from react-tinacms-github/src/github-editing-context/GithubAuthModal.tsx
export function ModalBuilder(modalProps: ModalBuilderProps) {
  return (
    <TinaReset>
      <Modal>
        <ModalPopup>
          <ModalHeader close={modalProps.close}>{modalProps.title}</ModalHeader>
          <ModalBody padded>
            <p>{modalProps.message}</p>
            {modalProps.error && <ErrorLabel>{modalProps.error}</ErrorLabel>}
          </ModalBody>
          <ModalActions>
            {modalProps.actions.map((action: any) => (
              <AsyncButton {...action} />
            ))}
          </ModalActions>
        </ModalPopup>
      </Modal>
    </TinaReset>
  );
}

export const ErrorLabel = styled.p`
  color: var(--tina-color-error) !important;
`;

interface ModalBuilderProps {
  title: string;
  message: string;
  error?: string;
  actions: any[];
  close(): void;
}