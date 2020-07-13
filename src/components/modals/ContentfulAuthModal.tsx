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
import { ContentfulAuthenticationService } from '../../services/contentful/authentication';

export function ContentfulAuthModal({ onAuthSuccess, close }: ContentfulAuthModalProps) {
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
            const userAccessToken = ContentfulAuthenticationService.GetAccessTokenFromWindow(window);

            await cms.api.contentful.authenticate();

            if (userAccessToken) {
              onAuthSuccess(userAccessToken);
            }
            
            console.error("Could not locate authorization token")
          },
          primary: true,
        },
      ]}
      close={close}
    />
  );
}

export interface ContentfulAuthModalProps {
  onAuthSuccess(accessToken: string | null): void;
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
