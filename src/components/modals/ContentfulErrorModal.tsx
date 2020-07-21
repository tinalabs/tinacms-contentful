import React from 'react';
import { ModalBuilder } from './ModalBuilder';

export interface ContentfulAuthModalProps {
  error: Error,
  onClose(): void;
  onRetry(): void;
}

export function ContentfulErrorModal({ error, onClose, onRetry }: ContentfulAuthModalProps) {
  return (
    <ModalBuilder
      title="Something went wrong..."
      message={error.message}
      close={onClose}
      actions={[
        {
          name: 'Cancel',
          action: onClose
        },
        {
          name: 'Log in again',
          primary: true,
          action: onRetry
        }
      ]}
    />
  );
}

export default ContentfulErrorModal;