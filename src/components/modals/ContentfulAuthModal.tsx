import {
  useCMS,
  Modal,
  ModalPopup,
  ModalHeader,
  ModalBody,
  ModalActions,
} from 'tinacms';
import { TinaReset } from '@tinacms/styles';
import { AsyncButton } from '../components/AsyncButton';
import styled from 'styled-components';
import React from 'react';

export interface ContentfulAuthModalProps {
  onAuthSuccess(): void;
  close(): void;
}
export function ContentfulAuthModel({
  onAuthSuccess,
  close,
}: ContentfulAuthModalProps) {
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
            await cms.api.contentful.authenticate();
            onAuthSuccess();
          },
          primary: true,
        },
      ]}
      close={close}
    />
  );
}

interface ModalBuilderProps {
  title: string;
  message: string;
  error?: string;
  actions: any[];
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
