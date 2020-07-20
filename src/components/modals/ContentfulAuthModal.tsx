import {
  useCMS,
  Modal,
  ModalPopup,
  ModalHeader,
  ModalBody,
  ModalActions,
} from 'tinacms';
import { TinaReset } from '@tinacms/styles';
import { AsyncButton } from '../AsyncButton';
import styled from 'styled-components';
import React from 'react';

export function ContentfulAuthModal({ onAuthSuccess, onAuthFailure, close }: ContentfulAuthModalProps) {
  const cms = useCMS();

  return (
    <ModalBuilder
      title="Contentful Authorization"
      message="To save edits, Tina requires Contenful authorization. On save, changes will be sent to Contentful usings your account."
      actions={[
        {
          name: 'Cancel',
          action: close,
        },
        {
          name: 'Continue to Contentful',
          action: async () => {
            try {
              if (cms.api.contentful) {
                await cms.api.contentful.authenticate();

                onAuthSuccess();
              }

              throw new Error("No contentful API client found. Please register a client with Tina.")
            }
            catch (error) {
              onAuthFailure(error);
            }
          },
          primary: true,
        },
      ]}
      close={close}
    />
  );
}

export interface ContentfulAuthModalProps {
  onAuthSuccess(): void;
  onAuthFailure(message: string): void;
  close(): void;
}

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
