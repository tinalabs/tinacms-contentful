import React, { useContext } from 'react';
import { useCMS } from 'tinacms';
import { TinaCMS } from '../../declarations';
import { AUTH_FAILURE, AUTH_SUCCESS } from '../../events';
import { ModalBuilder } from './ModalBuilder';

export interface ContentfulAuthModalProps {
  onClose(): void;
}

export function ContentfulAuthModal({ onClose }: ContentfulAuthModalProps) {
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
                  cms.events.dispatch({
                    type: AUTH_SUCCESS,
                    userAccessToken: userAccessToken,
                  });
                }
              } else {
                throw new Error(
                  'No contentful API client found. Please register a client with Tina.'
                );
              }
            } catch (error) {
              cms.events.dispatch({
                type: AUTH_FAILURE,
                error: error,
              });
            }
          },
        },
      ]}
    />
  );
}

export default ContentfulAuthModal;
