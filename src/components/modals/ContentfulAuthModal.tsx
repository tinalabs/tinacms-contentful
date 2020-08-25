import React from 'react';
import {
  useCMS
} from 'tinacms';
import { TinaCMS } from '../../declarations';
import { ModalBuilder } from './ModalBuilder';

export interface ContentfulAuthModalProps {
  onAuthSuccess(userAccessToken: string): void;
  onAuthFailure(error: Error): void;
  onClose(): void;
}

export function ContentfulAuthModal({ onAuthSuccess, onAuthFailure, onClose }: ContentfulAuthModalProps) {
  const cms = useCMS();

  return (
    <ModalBuilder
      title="Contentful Authorization"
      message="To save edits, Tina requires Contenful authorization. On save, changes will be sent to Contentful using your account."
      close={onClose}
      actions={[
        {
          name: 'Cancel',
          action: onClose,
        },
        {
          name: 'Continue to Contentful',
          primary: true,
          action: async () => {
            try {
              if (cms.api.contentful && cms.api.contentful.authenticate) {
                const userAccessToken = await (cms as TinaCMS).api.contentful.authenticate();

                if (userAccessToken) {
                  onAuthSuccess(userAccessToken);
                }
                else {
                  throw new Error("No user access token was returned.")
                }
              }
              else {
                throw new Error("No contentful API client found. Please register a client with Tina.")
              }
            }
            catch (error) {
              onAuthFailure(error);
            }
          }
        },
      ]}
    />
  );
}

export default ContentfulAuthModal;